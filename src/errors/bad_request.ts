import CustomApiError from './custom_error';
import { StatusCodes } from 'http-status-codes';

export default class BadRequestError extends CustomApiError {
  constructor(message: string) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}
