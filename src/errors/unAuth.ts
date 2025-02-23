import CustomApiError from './custom-error';
import { StatusCodes } from 'http-status-codes';

export default class UnAuthenticatedError extends CustomApiError {
  constructor(message: string) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}
