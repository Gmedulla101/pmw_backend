"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const unAuth_1 = __importDefault(require("../errors/unAuth"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new unAuth_1.default('JWT token missing!');
    }
    const token = authHeader.split(' ')[1];
    try {
        const authSecret = process.env.JWT_SECRET;
        if (!authSecret) {
            throw new Error('Secret validation failed: Empty secret');
        }
        const payload = jsonwebtoken_1.default.verify(token, authSecret);
        req.user = {
            username: payload.username,
            email: payload.email,
            userId: payload.userId,
        };
        next();
    }
    catch (err) {
        throw new unAuth_1.default(err.message);
    }
};
exports.default = auth;
//# sourceMappingURL=auth-middleware.js.map