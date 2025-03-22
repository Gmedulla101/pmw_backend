import prisma from '../db';
import { StatusCodes } from 'http-status-codes';
import UnAuthenticatedError from '../errors/unauth';
import BadRequestError from '../errors/bad-request';
import NotFound from '../errors/not-found';
import { ModifiedReq } from '../middleware/auth-middleware';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';

export const getProfileInfo = asyncHandler(
  async (req: ModifiedReq, res: Response) => {
    if (!req.user) {
      throw new UnAuthenticatedError('Unauthorised operation');
    }

    const { userId } = req.user;

    const user = await prisma.users.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestError('This user does not exist!');
    }

    const { createdAt, firstName, lastName, username, email, profilePic } =
      user;

    res.status(StatusCodes.OK).json({
      success: true,
      user: {
        firstName,
        lastName,
        username,
        email,
        profilePic,
        createdAt,
      },
    });
  }
);
