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
exports.getProfileInfo = void 0;
const db_1 = __importDefault(require("../db"));
const http_status_codes_1 = require("http-status-codes");
const unAuth_1 = __importDefault(require("../errors/unAuth"));
const bad_request_1 = __importDefault(require("../errors/bad-request"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.getProfileInfo = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new unAuth_1.default('Unauthorised operation');
    }
    const { userId } = req.user;
    const user = yield db_1.default.users.findFirst({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new bad_request_1.default('This user does not exist!');
    }
    const { createdAt, firstName, lastName, username, email, profilePic } = user;
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        user: {
            firstName,
            lastName,
            username,
            email,
            profilePic,
            createdAt,
        },
    });
}));
//# sourceMappingURL=user-controller.js.map