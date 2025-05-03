"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../middleware/auth-middleware"));
//CONTROLLERS
const txn_controller_1 = require("../controllers/txn-controller");
const txnRouter = (0, express_1.Router)();
txnRouter.post('/create-transaction', auth_middleware_1.default, txn_controller_1.createTransaction);
txnRouter.get('/get-all-transactions', auth_middleware_1.default, txn_controller_1.getAllTransactions);
txnRouter.get('/get-transaction/:txnId', auth_middleware_1.default, txn_controller_1.getTransaction);
txnRouter.put('/update-transaction/:txnId', auth_middleware_1.default, txn_controller_1.updateTransaction);
txnRouter.delete('/delete-transaction', auth_middleware_1.default, txn_controller_1.deleteTransaction);
txnRouter.post('/transaction-invite/:txnId', auth_middleware_1.default, txn_controller_1.inviteToTransaction);
txnRouter.patch('/join-transaction/:txnId', auth_middleware_1.default, txn_controller_1.joinTransaction);
//PAYMENT AND DELIVERY CONFIRMATION ROUTES
txnRouter.post('/make-payment/:txnId', auth_middleware_1.default, txn_controller_1.makePayment);
txnRouter.get('/verify-payment/:txnRef', auth_middleware_1.default, txn_controller_1.verfiyPayment);
txnRouter.put('deliver-goods/:txnId', auth_middleware_1.default, txn_controller_1.deliverGoods);
txnRouter.get('/get-banks', auth_middleware_1.default, txn_controller_1.getBanks);
txnRouter.get('/resolve-account', auth_middleware_1.default, txn_controller_1.resolveAccount);
txnRouter.post('/collect-payment', auth_middleware_1.default, txn_controller_1.collectPayment);
exports.default = txnRouter;
//# sourceMappingURL=txn-route.js.map