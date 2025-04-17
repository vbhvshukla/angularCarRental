import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";

configDotenv({ path: ".env" })

const user = process.env.EMAIL_USER;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: user,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, text, attachments = "" }) => {

  const mailOptions = {
    from: user,
    to,
    subject,
    text,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log('Node Mailer :: ', error);
  }
  console.log(`Email sent to ${to}`);
};
