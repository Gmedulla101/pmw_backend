"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../middleware/auth-middleware"));
const user_controller_1 = require("../controllers/user-controller");
const userRouter = (0, express_1.Router)();
userRouter.get('/profile-info', auth_middleware_1.default, user_controller_1.getProfileInfo);
exports.default = userRouter;
//# sourceMappingURL=user-route.js.map