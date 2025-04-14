import prisma from '../db';
import { StatusCodes } from 'http-status-codes';
import UnAuthenticatedError from '../errors/unauth';
import BadRequestError from '../errors/bad-request';
import NotFoundError from '../errors/not-found';
import { ModifiedReq } from '../middleware/auth-middleware';
import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import transporter from '../utils/nodemailer';
import generateCreateTxnEmail from '../utils/join-txn-info';

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
      buyerId,
      sellerId,
      productConfirmed,
      cashConfirmed,
      invitationSent,
    } = req.body;

    interface UpdateObject {
      status?: string;
      productConfirmed?: boolean;
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
    }

    await prisma.transactions.update({
      where: { id: txnId },
      data: {
        invitationSent: true,
      },
    });

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

    //FIND THE TRANSACTION
    const txn = await prisma.transactions.findUnique({
      where: {
        id: txnId,
      },
    });

    if (!txn) {
      throw new NotFoundError('The requested transaction does not exist');
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
