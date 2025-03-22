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

//USER REGISTRATION
export const register = asyncHandler(
  async (req: ModifiedReq, res: Response, next: NextFunction) => {
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !email || !password) {
      throw new BadRequestError(
        'Fill in the required fields to complete your registration'
      );
    }

    //CHECKING IF USER ALREADY EXISTS
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          {
            email: email,
          },
          {
            username: username,
          },
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestError('This user already exists');
    }

    //HASHING THE USER'S PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.users.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        password: hashedPassword,
      },
    });

    //CREATING JWT TOKEN TO SEND TO THE CLIENT
    const authSecret = process.env.JWT_SECRET;
    if (!authSecret) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        msg: "There's something wrong in our servers, we're on it!",
      });
      throw new Error('ENV secret is missing');
    }
    const token = jwt.sign(
      { userId: newUser.id, username, email },
      authSecret,
      {
        expiresIn: '30d',
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      msg: 'Registration successful',
      user: {
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
      token,
    });
  }
);

//USER LOGIN
export const login = asyncHandler(async (req: ModifiedReq, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please fill in the complete details');
  }

  //CHECKING TO SEE IF THE USER EXISTS
  const existingUser = await prisma.users.findUnique({
    where: {
      email: email,
    },
  });

  if (!existingUser) {
    throw new BadRequestError(
      'The requested user does not exist, please create an account to use our services'
    );
  }

  //IF THE USER EXISTS CHECK IF THE PASSWORD IS CORRECT
  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password
  );

  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError('The password you entered is not correct');
  }

  //IF PASSWORD IS CORRECT, TOKENISE AND PROCEED
  const authSecret = process.env.JWT_SECRET;
  if (!authSecret) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: "There's something wrong in our servers, we're on it!",
    });
    throw new Error('ENV secret is missing');
  }
  const token = jwt.sign(
    {
      userId: existingUser.id,
      username: existingUser.username,
      email: existingUser.email,
    },
    authSecret,
    {
      expiresIn: '30d',
    }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    msg: 'Login successful',
    token,
    user: {
      username: existingUser.username,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
    },
  });
});
