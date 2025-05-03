import { Request, Response, NextFunction } from 'express';
import UnAuthenticatedError from '../errors/unAuth';
import jwt from 'jsonwebtoken';

export interface ModifiedReq extends Request {
  user?: {
    username: string;
    email: string;
    userId: string;
  };
}

const auth = (req: ModifiedReq, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnAuthenticatedError('JWT token missing!');
  }

  const token = authHeader.split(' ')[1];

  try {
    const authSecret = process.env.JWT_SECRET;
    if (!authSecret) {
      throw new Error('Secret validation failed: Empty secret');
    }

    const payload: any = jwt.verify(token, authSecret);
    req.user = {
      username: payload.username,
      email: payload.email,
      userId: payload.userId,
    };
    next();
  } catch (err: any) {
    throw new UnAuthenticatedError(err.message);
  }
};

export default auth;
