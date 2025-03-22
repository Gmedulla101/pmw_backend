import prisma from '../db';
import { StatusCodes } from 'http-status-codes';
import UnAuthenticatedError from '../errors/unauth';
import BadRequestError from '../errors/bad-request';
import NotFound from '../errors/not-found';
import { ModifiedReq } from '../middleware/auth-middleware';
import { Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

export const createTransaction = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    res.status(StatusCodes.OK).json({
      msg: 'Transation created',
    });
  }
);

export const getAllTransactions = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    res.status(StatusCodes.OK).json({
      msg: 'Fetched transactions',
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
