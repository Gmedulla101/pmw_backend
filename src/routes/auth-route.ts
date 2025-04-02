import { Router } from 'express';

import {
  login,
  register,
  confirmEmailSendOTP,
} from '../controllers/auth-controller';

const authRouter = Router();

authRouter.post('/register-user', register);
authRouter.post('/user-login', login);
authRouter.post('/confirm-email', confirmEmailSendOTP);

export default authRouter;
