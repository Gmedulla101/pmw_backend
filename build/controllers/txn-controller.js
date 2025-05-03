"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectPayment = exports.resolveAccount = exports.getBanks = exports.deliverGoods = exports.verfiyPayment = exports.makePayment = exports.joinTransaction = exports.inviteToTransaction = exports.deleteTransaction = exports.updateTransaction = exports.getTransaction = exports.getAllTransactions = exports.createTransaction = void 0;
const db_1 = __importDefault(require("../db"));
const axios_1 = __importDefault(require("axios"));
const http_status_codes_1 = require("http-status-codes");
//ERRORS
const unauth_1 = __importDefault(require("../errors/unauth"));
const bad_request_1 = __importDefault(require("../errors/bad-request"));
const not_found_1 = __importDefault(require("../errors/not-found"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
//EMAIL FUNCTIONALIKTY UTILS
const nodemailer_1 = __importDefault(require("../utils/nodemailer"));
const join_txn_info_1 = __importDefault(require("../utils/join-txn-info"));
const confirm_payment_info_1 = __importDefault(require("../utils/confirm-payment-info"));
//CREATE TRANSACTION FUNCTIONALITY
exports.createTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    //IDENTIFYING ID OF THE INITIATOR
    const initiatorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { userRole, txnItem, txnItemDescription, txnItemCategory, txnItemValue, } = req.body;
    if (!initiatorId) {
        throw new unauth_1.default('Invalid request user');
    }
    //CHECKING FOR AND CREATING THE CATEGORIES
    let category = yield db_1.default.categories.findUnique({
        where: { categoryName: txnItemCategory },
    });
    if (!category) {
        console.log(`Category "${txnItemCategory}" not found. Creating new category...`);
        category = yield db_1.default.categories.create({
            data: { categoryName: txnItemCategory },
        });
    }
    //CREATING THE TRANSACTION
    const newTransaction = yield db_1.default.transactions.create({
        data: {
            initiatorId,
            sellerId: userRole === 'seller' ? initiatorId : null,
            buyerId: userRole === 'buyer' ? initiatorId : null,
            txnItem,
            txnItemCategoryId: category.id,
            txnItemValue: Number(txnItemValue),
            txnItemDescription,
        },
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: 'Transation created',
        transaction: newTransaction,
    });
}));
//GET ALL TRASNSACTIONS FUNCTIONALITY
exports.getAllTransactions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new unauth_1.default('Unauthorised operation');
    }
    const userTransactions = yield db_1.default.transactions.findMany({
        where: {
            OR: [{ sellerId: userId }, { buyerId: userId }],
        },
        include: {
            seller: true,
            buyer: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    if (!userTransactions) {
        throw new not_found_1.default('There are no transactions associated with this user');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: 'Fetched transactions',
        transactions: userTransactions,
    });
}));
//GETTING ONE TRANSACTION FUNCTIONALITY
exports.getTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { txnId } = req.params;
    const txn = yield db_1.default.transactions.findFirst({
        where: {
            id: txnId,
        },
        include: {
            seller: true,
            buyer: true,
            category: true,
        },
    });
    if (!txn) {
        throw new not_found_1.default('The requested transaction does not exist');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: 'Fetched transaction',
        txn: txn,
    });
}));
//UPDATE TRANSACTION FUNCTIONALITY
exports.updateTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { txnId } = req.params;
    const { status, productConfirmed, cashConfirmed, invitationSent, productDelivered, } = req.body;
    let updateObject = {};
    if (status) {
        updateObject.status = status;
    }
    if (productConfirmed) {
        updateObject.productConfirmed = productConfirmed;
    }
    if (productDelivered) {
        updateObject.productDelivered = productDelivered;
    }
    if (cashConfirmed) {
        updateObject.cashConfirmed = cashConfirmed;
    }
    if (invitationSent) {
        updateObject.invitationSent = invitationSent;
    }
    const updatedTxn = yield db_1.default.transactions.update({
        where: {
            id: txnId,
        },
        data: Object.assign({}, updateObject),
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: 'Transaction updated',
        txn: updatedTxn,
    });
}));
//DELETE TRANSACTION FUNCTIONALTY
exports.deleteTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: 'Transaction deleted',
    });
}));
//INVITE TO TRANSACTION FUNCTIONALITY
exports.inviteToTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { txnId } = req.params;
    const { email } = req.body;
    const transaction = yield db_1.default.transactions.findUnique({
        where: { id: txnId },
    });
    if (!transaction) {
        throw new bad_request_1.default('The requested transaction does not exist');
    }
    if (email) {
        const emailInfo = (0, join_txn_info_1.default)(email, transaction.id);
        nodemailer_1.default.sendMail(emailInfo, (error) => {
            if (error) {
                throw new bad_request_1.default(JSON.stringify(error));
            }
        });
        yield db_1.default.transactions.update({
            where: { id: txnId },
            data: {
                invitationSent: true,
            },
        });
    }
    else {
        yield db_1.default.transactions.update({
            where: { id: txnId },
            data: {
                invitationSent: true,
            },
        });
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
    });
}));
//JOIN TRANSACTION FUNCTIONALITY
exports.joinTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { txnId } = req.params;
    if (!userId) {
        throw new unauth_1.default('Invalid request user');
    }
    //Find the transaction
    const txn = yield db_1.default.transactions.findUnique({
        where: {
            id: txnId,
        },
    });
    if (!txn) {
        throw new not_found_1.default('The requested transaction does not exist');
    }
    if (!txn.invitationSent) {
        throw new bad_request_1.default('An invitation has not been sent for this transaction, wait for the invitation and try again');
    }
    let updatedTxn;
    if (!txn.sellerId) {
        updatedTxn = yield db_1.default.transactions.update({
            where: {
                id: txnId,
            },
            data: {
                sellerId: userId,
            },
        });
    }
    else if (!txn.buyerId) {
        updatedTxn = yield db_1.default.transactions.update({
            where: {
                id: txnId,
            },
            data: {
                buyerId: userId,
            },
        });
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        updatedTxn,
    });
}));
//PAYMENTS
exports.makePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { txnId } = req.params;
    const email = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    if (!email) {
        throw new unauth_1.default('User is not logged in');
    }
    const requiredTxn = yield db_1.default.transactions.findUnique({
        where: { id: txnId },
    });
    if (!requiredTxn) {
        throw new bad_request_1.default('The required transaction does not exist, try again!');
    }
    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!SECRET_KEY) {
        throw new bad_request_1.default('ENV malformed: Paystack');
    }
    const response = yield axios_1.default.post('https://api.paystack.co/transaction/initialize', {
        amount: ((requiredTxn.txnItemValue * 0.02 + requiredTxn.txnItemValue) *
            100).toString(),
        email,
        callback_url: `http://localhost:5173/transaction/${requiredTxn.id}`,
        reference: 'pay' + '_' + requiredTxn.id,
    }, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SECRET_KEY}`,
        },
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        sucess: true,
        data: response.data.data,
    });
}));
exports.verfiyPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { txnRef } = req.params;
    //Verifying the transaction with paystack
    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!SECRET_KEY) {
        throw new bad_request_1.default('ENV malformed: Paystack');
    }
    const response = yield axios_1.default.get(`https://api.paystack.co/transaction/verify/${txnRef}`, {
        headers: {
            Authorization: `Bearer ${SECRET_KEY}`,
        },
    });
    if (response.data.data.status === 'success') {
        const txnId = txnRef.split('_')[1];
        const paidTxn = yield db_1.default.transactions.findUnique({
            where: {
                id: txnId,
            },
            include: {
                seller: true,
                buyer: true,
            },
        });
        if (!paidTxn) {
            throw new bad_request_1.default("I don't know how you paid for a transaction that does not exist, but you are a legend!");
        }
        yield db_1.default.transactions.update({
            where: {
                id: txnId,
            },
            data: {
                cashConfirmed: true,
            },
        });
        const emailInfo = (0, confirm_payment_info_1.default)((_a = paidTxn.seller) === null || _a === void 0 ? void 0 : _a.email, (_b = paidTxn.buyer) === null || _b === void 0 ? void 0 : _b.firstName, paidTxn.txnItemValue, paidTxn.txnItem);
        nodemailer_1.default.sendMail(emailInfo, (error) => {
            if (error) {
                throw new bad_request_1.default(`${error}`);
            }
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            sucess: true,
            data: 'Payment verified, please refresh the page',
        });
    }
    else {
        throw new bad_request_1.default('Unsuccessful payment');
    }
}));
//PRODUCT/SERVICE
exports.deliverGoods = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { txnId } = req.params;
    console.log(txnId);
}));
//USER PAYMENT PROCESSES
exports.getBanks = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!SECRET_KEY) {
        throw new bad_request_1.default('ENV error: paystack');
    }
    const response = yield axios_1.default.get('https://api.paystack.co/bank', {
        headers: {
            Authorization: `Bearer ${SECRET_KEY}`,
        },
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        data: response.data.data,
    });
}));
exports.resolveAccount = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { account_number, bank_code } = req.query;
    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!SECRET_KEY) {
        throw new bad_request_1.default('ENV error: paystack');
    }
    const response = yield axios_1.default.get(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, {
        headers: {
            Authorization: `Bearer ${SECRET_KEY}`,
        },
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        data: response.data.data,
    });
}));
exports.collectPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { txnId } = req.body;
    const transaction = yield db_1.default.transactions.findUnique({
        where: {
            id: txnId,
        },
    });
    if (!transaction) {
        throw new bad_request_1.default('The transaction you are trying to receive a payment for does not exist!');
    }
    yield db_1.default.transactions.update({
        where: {
            id: txnId,
        },
        data: {
            status: 'completed',
        },
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        msg: 'Payment successfully processed',
    });
}));
//# sourceMappingURL=txn-controller.js.map