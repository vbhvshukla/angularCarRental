import nodemailer from "nodemailer";

const user = process.env.EMAIL_USER;
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: user,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, text, attachments }) => {
  const mailOptions = {
    from: user,
    to,
    subject,
    text,
    attachments, // Add attachments support
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${to}`);
};
