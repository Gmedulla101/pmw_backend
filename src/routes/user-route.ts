import { Router } from 'express';
import auth from '../middleware/auth-middleware';
import { getProfileInfo } from '../controllers/user-controller';

const userRouter = Router();

userRouter.get('/profile-info', auth, getProfileInfo);

export default userRouter;
