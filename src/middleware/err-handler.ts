import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import BadRequestError from '../errors/bad-request';

/* interface ModifiedErr extends Error {
  statusCode: number;
  errors: any;
  value: any;
  code: any;
  keyValue: any;
} */

const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, please try again later',
  };

  //VALIDATION ERROR
  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors)
      .map((items: any) => items.message)
      .join(', also, ');
    customError.statusCode = 400;
  }

  //CAST ERROR
  if (err.name === 'CastError') {
    customError.msg = `No item found with an id of ${err.value}`;
    customError.statusCode = 404;
  }

  // DUPLICATE ERROR
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field: Email already exists`;
    customError.statusCode = 400;
  }

  //INVALID PROVISIONING
  if (err.code === 'P2003') {
    customError.msg = 'Invalid seller or buyer ID provided';
    customError.statusCode = 400;
  }

  //PAYSTACK INVALIDITY ERROR
  if (err.response.data.type === 'validation_error') {
    customError.msg = err.response.data.message;
    customError.statusCode = err?.response?.status;
  }

  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
  res.status(customError.statusCode).json({ msg: customError.msg });
  return;
};

export default errorHandlerMiddleware;
