import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

import { emailTemplates } from './emailTemplates';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD
  }
});

export async function sendEmail(to: string, subject: string, htmlBody: string) {
  try {
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to,
      subject,
      html: htmlBody
    };
    console.log(mailOptions,'mail otitions');
    

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

