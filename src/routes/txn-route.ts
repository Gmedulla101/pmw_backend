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
  inviteToTransaction,
  makePayment,
  verfiyPayment,
} from '../controllers/txn-controller';

const txnRouter = Router();

txnRouter.post('/create-transaction', auth, createTransaction);
txnRouter.get('/get-all-transactions', auth, getAllTransactions);
txnRouter.get('/get-transaction/:txnId', auth, getTransaction);
txnRouter.put('/update-transaction/:txnId', auth, updateTransaction);
txnRouter.delete('/delete-transaction', auth, deleteTransaction);
txnRouter.post('/transaction-invite/:txnId', auth, inviteToTransaction);
txnRouter.patch('/join-transaction/:txnId', auth, joinTransaction);

//PAYMENT AND DELIVERY CONFIRMATION ROUTES
txnRouter.post('/make-payment/:txnId', auth, makePayment);
txnRouter.get('/verify-payment/:txnRef', auth, verfiyPayment);

export default txnRouter;
