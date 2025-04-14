import { Router } from 'express';
import auth from '../middleware/auth-middleware';
//CONTROLLERS
import {
  createTransaction,
  getTransaction,
  getAllTransactions,
  updateTransaction,
  deleteTransaction,
  joinTransaction,
  inviteToTransaction
} from '../controllers/txn-controller';

const txnRouter = Router();

txnRouter.post('/create-transaction', auth, createTransaction);
txnRouter.get('/get-all-transactions', auth, getAllTransactions);
txnRouter.get('/get-transaction/:txnId', auth, getTransaction);
txnRouter.put('/update-transaction/:txnId', auth, updateTransaction);
txnRouter.delete('/delete-transaction', auth, deleteTransaction);
txnRouter.post('/transaction-invite/:txnId', auth, inviteToTransaction)
txnRouter.patch('/join-transaction/:txnId', auth, joinTransaction);


export default txnRouter;
