"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const bad_request_1 = __importDefault(require("../errors/bad-request"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mailerUser = process.env.MAILER_USER;
const mailerPass = process.env.MAILER_PASS;
if (!mailerUser || !mailerPass) {
    throw new bad_request_1.default('Error parsing ENV: Nodemailer');
}
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: mailerUser,
        pass: mailerPass,
    },
});
exports.default = transporter;
//# sourceMappingURL=nodemailer.js.map