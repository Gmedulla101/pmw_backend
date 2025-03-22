import prisma from '../db';
import { StatusCodes } from 'http-status-codes';
import UnAuthenticatedError from '../errors/unauth';
import BadRequestError from '../errors/bad-request';
import NotFound from '../errors/not-found';
import { ModifiedReq } from '../middleware/auth-middleware';
import { Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

//CREATE TRANSACTION FUNCTIONALITY
export const createTransaction = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    //IDENTIFYING ID OF THE INITIATOR
    const initiatorId = req.user?.userId;
    const {
      seller,
      buyer,
      txnItem,
      txnItemDescription,
      txnItemCategory,
      txnItemValue,
    } = req.body;

    //MATCHING THE USER TO WHAT THEY SELECTED
    if (!initiatorId) {
      throw new BadRequestError('Unauthorised request');
    }
    const sellerProfile = seller
      ? await prisma.users.findUnique({ where: { username: seller } })
      : null;

    if (seller && !sellerProfile) throw new BadRequestError('Buyer not found');

    const buyerProfile = buyer
      ? await prisma.users.findUnique({ where: { username: buyer } })
      : null;

    if (buyer && !buyerProfile) throw new BadRequestError('Buyer not found');

    //CREATING THE TRANSACTION
    const newTransaction = await prisma.transactions.create({
      data: {
        sellerId: sellerProfile?.id || null,
        buyerId: buyerProfile?.id || null,
        txnItem,
        txnItemCategory,
        txnItemValue: Number(txnItemValue),
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

    res.status(StatusCodes.OK).json({
      msg: 'Fetched transactions',
      transactions: userTransactions,
    });
  }
);

export const getTransaction = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    res.status(StatusCodes.OK).json({
      msg: 'Fetched transaction',
    });
  }
);

export const updateTransaction = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    res.status(StatusCodes.OK).json({
      msg: 'Transaction updated',
    });
  }
);

export const deleteTransaction = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    res.status(StatusCodes.OK).json({
      msg: 'Transaction deleted',
    });
  }
);
