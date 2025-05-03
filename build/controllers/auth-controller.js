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
exports.confirmCodeResetPassword = exports.confirmEmailSendOTP = exports.login = exports.register = void 0;
const db_1 = __importDefault(require("../db"));
const http_status_codes_1 = require("http-status-codes");
const unauth_1 = __importDefault(require("../errors/unauth"));
const bad_request_1 = __importDefault(require("../errors/bad-request"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const not_found_1 = __importDefault(require("../errors/not-found"));
//////
const nodemailer_1 = __importDefault(require("../utils/nodemailer"));
const fg_pswd_info_1 = __importDefault(require("../utils/fg-pswd-info"));
//USER REGISTRATION
exports.register = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !email || !password) {
        throw new bad_request_1.default('Fill in the required fields to complete your registration');
    }
    //CHECKING IF USER ALREADY EXISTS
    const existingUser = yield db_1.default.users.findFirst({
        where: {
            OR: [
                {
                    email: email,
                },
                {
                    username: username,
                },
            ],
        },
    });
    if (existingUser) {
        throw new bad_request_1.default('This user already exists');
    }
    //HASHING THE USER'S PASSWORD
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    const newUser = yield db_1.default.users.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            username: username,
            password: hashedPassword,
        },
    });
    //CREATING JWT TOKEN TO SEND TO THE CLIENT
    const authSecret = process.env.JWT_SECRET;
    if (!authSecret) {
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            msg: "There's something wrong in our servers, we're on it!",
        });
        throw new Error('ENV secret is missing');
    }
    const token = jsonwebtoken_1.default.sign({ userId: newUser.id, username, email }, authSecret, {
        expiresIn: '30d',
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        msg: 'Registration successful',
        user: {
            userId: newUser.id,
            username: newUser.username,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
        },
        token,
    });
}));
//USER LOGIN
exports.login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new bad_request_1.default('Please fill in the complete details');
    }
    //CHECKING TO SEE IF THE USER EXISTS
    const existingUser = yield db_1.default.users.findUnique({
        where: {
            email: email,
        },
    });
    if (!existingUser) {
        throw new bad_request_1.default('The requested user does not exist, please create an account to use our services');
    }
    //IF THE USER EXISTS CHECK IF THE PASSWORD IS CORRECT
    const isPasswordCorrect = yield bcryptjs_1.default.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
        throw new unauth_1.default('The password you entered is not correct');
    }
    //IF PASSWORD IS CORRECT, TOKENISE AND PROCEED
    const authSecret = process.env.JWT_SECRET;
    if (!authSecret) {
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            msg: "There's something wrong in our servers, we're on it!",
        });
        throw new Error('ENV secret is missing');
    }
    const token = jsonwebtoken_1.default.sign({
        userId: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
    }, authSecret, {
        expiresIn: '30d',
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        msg: 'Login successful',
        token,
        user: {
            userId: existingUser.id,
            username: existingUser.username,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            email: existingUser.email,
        },
    });
}));
//CONFIRMING EMAIL TO SEND THE RESET CODE
exports.confirmEmailSendOTP = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        throw new bad_request_1.default('Please fill in all the fields');
    }
    const existingUser = yield db_1.default.users.findUnique({
        where: {
            email,
        },
    });
    if (!existingUser) {
        throw new not_found_1.default('The requested user does not exist');
    }
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const newEmailInfo = (0, fg_pswd_info_1.default)(existingUser.email, randomNumber);
    //IF THE USER CONFIRMATION ROW ALREADY EXISTS, IT WILL BE UPDATED ACCORDINGLY
    yield db_1.default.userConfirmation.upsert({
        where: { email },
        update: {
            confirmationCode: randomNumber,
        },
        create: {
            email,
            confirmationCode: randomNumber,
        },
    });
    nodemailer_1.default.sendMail(newEmailInfo, (error, info) => {
        if (error) {
            throw new bad_request_1.default(`Error sending email: ${JSON.stringify(error)}`);
        }
        else {
            res.status(http_status_codes_1.StatusCodes.OK).json({
                success: true,
                msg: 'Email confirmed, confirmation code sent',
                response: info.response,
                userId: existingUser.id,
            });
        }
    });
}));
exports.confirmCodeResetPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, email, password } = req.body;
    const userConfirmation = yield db_1.default.userConfirmation.findUnique({
        where: { email },
    });
    if (!userConfirmation) {
        throw new bad_request_1.default('This user has not requested for a password reset');
    }
    //CHECKING THE CONFIRMATION CODE
    if (userConfirmation.confirmationCode !== Number(code)) {
        throw new bad_request_1.default('The entered code is incorrect. Try again');
    }
    //ENCRYPTING THE PASSWORD
    const hashedSalt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, hashedSalt);
    yield db_1.default.users.update({
        where: { email },
        data: {
            password: hashedPassword,
        },
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        msg: 'Password reset succesful, proceeed to login',
    });
}));
//# sourceMappingURL=auth-controller.js.map