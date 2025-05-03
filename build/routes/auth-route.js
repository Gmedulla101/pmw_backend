"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth-controller");
const authRouter = (0, express_1.Router)();
authRouter.post('/register-user', auth_controller_1.register);
authRouter.post('/user-login', auth_controller_1.login);
authRouter.post('/confirm-email', auth_controller_1.confirmEmailSendOTP);
authRouter.post('/reset-password', auth_controller_1.confirmCodeResetPassword);
exports.default = authRouter;
//# sourceMappingURL=auth-route.js.map