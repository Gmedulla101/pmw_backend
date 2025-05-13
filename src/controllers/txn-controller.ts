import prisma from '../db';
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';

//ERRORS
import UnAuthenticatedError from '../errors/unAuth';
import BadRequestError from '../errors/bad-request';
import NotFoundError from '../errors/not-found';

//THINGS FROM EXPRESS
import { ModifiedReq } from '../middleware/auth-middleware';
import { Response } from 'express';
import asyncHandler from 'express-async-handler';

//EMAIL FUNCTIONALIKTY UTILS
import transporter from '../utils/nodemailer';
import generateCreateTxnEmail from '../utils/join-txn-info';
import sendPaymentConfimrationEmail from '../utils/confirm-payment-info';

//CREATE TRANSACTION FUNCTIONALITY
export const createTransaction = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    //IDENTIFYING ID OF THE INITIATOR
    const initiatorId = req.user?.userId;
    const {
      userRole,
      txnItem,
      txnItemDescription,
      txnItemCategory,
      txnItemValue,
    } = req.body;

    if (!initiatorId) {
      throw new UnAuthenticatedError('Invalid request user');
    }

    //CHECKING FOR AND CREATING THE CATEGORIES
    let category = await prisma.categories.findUnique({
      where: { categoryName: txnItemCategory },
    });

    if (!category) {
      console.log(
        `Category "${txnItemCategory}" not found. Creating new category...`
      );
      category = await prisma.categories.create({
        data: { categoryName: txnItemCategory },
      });
    }

    //CREATING THE TRANSACTION
    const newTransaction = await prisma.transactions.create({
      data: {
        initiatorId,
        sellerId: userRole === 'seller' ? initiatorId : null,
        buyerId: userRole === 'buyer' ? initiatorId : null,
        txnItem,
        txnItemCategoryId: category.id,
        txnItemValue: Number(txnItemValue),
        txnItemDescription,
      },
    });

    res.status(StatusCodes.OK).json({
      msg: 'Transation created',
      transaction: newTransaction,
    });
  }
);

//GET ALL TRASNSACTIONS FUNCTIONALITY
export const getAllTransactions = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnAuthenticatedError('Unauthorised operation');
    }

    const userTransactions = await prisma.transactions.findMany({
      where: {
        OR: [{ sellerId: userId }, { buyerId: userId }],
      },
      include: {
        seller: true,
        buyer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!userTransactions) {
      throw new NotFoundError(
        'There are no transactions associated with this user'
      );
    }

    res.status(StatusCodes.OK).json({
      msg: 'Fetched transactions',
      transactions: userTransactions,
    });
  }
);

//GETTING ONE TRANSACTION FUNCTIONALITY
export const getTransaction = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    const { txnId } = req.params;

    const txn = await prisma.transactions.findFirst({
      where: {
        id: txnId,
      },
      include: {
        seller: true,
        buyer: true,
        category: true,
      },
    });

    if (!txn) {
      throw new NotFoundError('The requested transaction does not exist');
    }

    res.status(StatusCodes.OK).json({
      msg: 'Fetched transaction',
      txn: txn,
    });
  }
);

//UPDATE TRANSACTION FUNCTIONALITY
export const updateTransaction = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    const { txnId } = req.params;
    const {
      status,
      productConfirmed,
      cashConfirmed,
      invitationSent,
      productDelivered,
    } = req.body;

    interface UpdateObject {
      status?: string;
      productConfirmed?: boolean;
      productDelivered?: boolean;
      cashConfirmed?: boolean;
      invitationSent?: boolean;
      sellerId?: string;
      buyerId?: string;
    }

    let updateObject: UpdateObject = {};

    if (status) {
      updateObject.status = status;
    }
    if (productConfirmed) {
      updateObject.productConfirmed = productConfirmed;
    }
    if (productDelivered) {
      updateObject.productDelivered = productDelivered;
    }
    if (cashConfirmed) {
      updateObject.cashConfirmed = cashConfirmed;
    }
    if (invitationSent) {
      updateObject.invitationSent = invitationSent;
    }

    const updatedTxn = await prisma.transactions.update({
      where: {
        id: txnId,
      },
      data: {
        ...updateObject,
      },
    });

    res.status(StatusCodes.OK).json({
      msg: 'Transaction updated',
      txn: updatedTxn,
    });
  }
);

//DELETE TRANSACTION FUNCTIONALTY
export const deleteTransaction = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    res.status(StatusCodes.OK).json({
      msg: 'Transaction deleted',
    });
  }
);

//INVITE TO TRANSACTION FUNCTIONALITY
export const inviteToTransaction = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    const { txnId } = req.params;
    const { email } = req.body;

    const transaction = await prisma.transactions.findUnique({
      where: { id: txnId },
    });

    if (!transaction) {
      throw new BadRequestError('The requested transaction does not exist');
    }

    if (email) {
      const emailInfo = generateCreateTxnEmail(email, transaction.id);

      transporter.sendMail(emailInfo, (error) => {
        if (error) {
          throw new BadRequestError(JSON.stringify(error));
        }
      });
      await prisma.transactions.update({
        where: { id: txnId },
        data: {
          invitationSent: true,
        },
      });
    } else {
      await prisma.transactions.update({
        where: { id: txnId },
        data: {
          invitationSent: true,
        },
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
    });
  }
);

//JOIN TRANSACTION FUNCTIONALITY
export const joinTransaction = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    const userId = req.user?.userId;
    const { txnId } = req.params;

    if (!userId) {
      throw new UnAuthenticatedError('Invalid request user');
    }

    //Find the transaction
    const txn = await prisma.transactions.findUnique({
      where: {
        id: txnId,
      },
    });

    if (!txn) {
      throw new NotFoundError('The requested transaction does not exist');
    }

    if (!txn.invitationSent) {
      throw new BadRequestError(
        'An invitation has not been sent for this transaction, wait for the invitation and try again'
      );
    }

    let updatedTxn;

    if (!txn.sellerId) {
      updatedTxn = await prisma.transactions.update({
        where: {
          id: txnId,
        },
        data: {
          sellerId: userId,
        },
      });
    } else if (!txn.buyerId) {
      updatedTxn = await prisma.transactions.update({
        where: {
          id: txnId,
        },
        data: {
          buyerId: userId,
        },
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      updatedTxn,
    });
  }
);

//PAYMENTS
export const makePayment = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    const { txnId } = req.params;
    const email = req.user?.email;

    if (!email) {
      throw new UnAuthenticatedError('User is not logged in');
    }

    const requiredTxn = await prisma.transactions.findUnique({
      where: { id: txnId },
    });

    if (!requiredTxn) {
      throw new BadRequestError(
        'The required transaction does not exist, try again!'
      );
    }

    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!SECRET_KEY) {
      throw new BadRequestError('ENV malformed: Paystack');
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount: (
          (requiredTxn.txnItemValue * 0.02 + requiredTxn.txnItemValue) *
          100
        ).toString(),
        email,
        callback_url: `https://pmw-frontend.vercel.app/transaction/${requiredTxn.id}`,
        reference: 'pay' + '_' + requiredTxn.id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SECRET_KEY}`,
        },
      }
    );

    res.status(StatusCodes.OK).json({
      sucess: true,
      data: response.data.data,
    });
  }
);

export const verfiyPayment = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    const { txnRef } = req.params;

    //Verifying the transaction with paystack

    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!SECRET_KEY) {
      throw new BadRequestError('ENV malformed: Paystack');
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${txnRef}`,
      {
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
        },
      }
    );

    if (response.data.data.status === 'success') {
      const txnId = txnRef.split('_')[1];

      const paidTxn = await prisma.transactions.findUnique({
        where: {
          id: txnId,
        },
        include: {
          seller: true,
          buyer: true,
        },
      });

      if (!paidTxn) {
        throw new BadRequestError(
          "I don't know how you paid for a transaction that does not exist, but you are a legend!"
        );
      }

      await prisma.transactions.update({
        where: {
          id: txnId,
        },
        data: {
          cashConfirmed: true,
        },
      });

      const emailInfo = sendPaymentConfimrationEmail(
        paidTxn.seller?.email,
        paidTxn.buyer?.firstName,
        paidTxn.txnItemValue,
        paidTxn.txnItem
      );

      transporter.sendMail(emailInfo, (error) => {
        if (error) {
          throw new BadRequestError(`${error}`);
        }
      });

      res.status(StatusCodes.OK).json({
        sucess: true,
        data: 'Payment verified, please refresh the page',
      });
    } else {
      throw new BadRequestError('Unsuccessful payment');
    }
  }
);

//PRODUCT/SERVICE
export const deliverGoods = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    const { txnId } = req.params;
    console.log(txnId);
  }
);

//USER PAYMENT PROCESSES
export const getBanks = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!SECRET_KEY) {
      throw new BadRequestError('ENV error: paystack');
    }

    const response = await axios.get('https://api.paystack.co/bank', {
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
      },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: response.data.data,
    });
  }
);

export const resolveAccount = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    const { account_number, bank_code } = req.query;

    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!SECRET_KEY) {
      throw new BadRequestError('ENV error: paystack');
    }

    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
        },
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: response.data.data,
    });
  }
);

export const collectPayment = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    const { txnId } = req.body;

    const transaction = await prisma.transactions.findUnique({
      where: {
        id: txnId,
      },
    });

    if (!transaction) {
      throw new BadRequestError(
        'The transaction you are trying to receive a payment for does not exist!'
      );
    }

    await prisma.transactions.update({
      where: {
        id: txnId,
      },
      data: {
        status: 'completed',
      },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      msg: 'Payment successfully processed',
    });
  }
);
