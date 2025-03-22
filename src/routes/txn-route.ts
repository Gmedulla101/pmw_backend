import { Router } from 'express';
import auth from '../middleware/auth-middleware';
//CONTROLLERS
import {
  createTransaction,
  getTransaction,
  getAllTransactions,
  updateTransaction,
  deleteTransaction,
} from '../controllers/txn-controller';

const txnRouter = Router();

txnRouter.post('/create-transaction', auth, createTransaction);
txnRouter.get('/get-all-transactions', auth, getAllTransactions);
txnRouter.get('/get-transaction', auth, getTransaction);
txnRouter.put('/update-transaction', auth, updateTransaction);
txnRouter.delete('/delete-transaction', auth, deleteTransaction);

export default txnRouter;
