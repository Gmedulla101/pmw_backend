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
exports.joinTransaction = exports.deleteTransaction = exports.updateTransaction = exports.getTransaction = exports.getAllTransactions = exports.createTransaction = void 0;
const db_1 = __importDefault(require("../db"));
const http_status_codes_1 = require("http-status-codes");
const unauth_1 = __importDefault(require("../errors/unauth"));
const not_found_1 = __importDefault(require("../errors/not-found"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
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
exports.updateTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { txnId } = req.params;
    const { status, buyerId, sellerId, productConfirmed, cashConfirmed, invitationSent, } = req.body;
    let updateObject = {};
    if (status) {
        updateObject.status = status;
    }
    if (productConfirmed) {
        updateObject.productConfirmed = productConfirmed;
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
exports.deleteTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: 'Transaction deleted',
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
    //FIND THE TRANSACTION
    const txn = yield db_1.default.transactions.findUnique({
        where: {
            id: txnId,
        },
    });
    if (!txn) {
        throw new not_found_1.default('The requested transaction does not exist');
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
//# sourceMappingURL=txn-controller.js.map