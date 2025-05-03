import nodemailer from 'nodemailer';
import BadRequestError from '../errors/bad-request';
import dotenv from 'dotenv';

dotenv.config();

const mailerUser = process.env.MAILER_USER;
const mailerPass = process.env.MAILER_PASS;

if (!mailerUser || !mailerPass) {
  throw new BadRequestError('Error parsing ENV: Nodemailer');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: mailerUser,
    pass: mailerPass,
  },
});

export default transporter;
