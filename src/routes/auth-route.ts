import { Router } from 'express';

import {
  login,
  register,
  confirmEmailSendOTP,
  confirmCodeResetPassword,
} from '../controllers/auth-controller';

const authRouter = Router();

authRouter.post('/register-user', register);
authRouter.post('/user-login', login);
authRouter.post('/confirm-email', confirmEmailSendOTP);
authRouter.post('/reset-password', confirmCodeResetPassword);

export default authRouter;
