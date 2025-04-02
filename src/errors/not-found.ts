import CustomApiError from './custom-error';
import { StatusCodes } from 'http-status-codes';

export default class NotFoundError extends CustomApiError {
  constructor(message: string) {
    super(message, StatusCodes.NOT_FOUND);
  }
}
