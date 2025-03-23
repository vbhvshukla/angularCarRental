import nodemailer from "nodemailer";

const user = process.env.EMAIL_USER;
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: user,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (email, subject, message) => {
  const mailOptions = {
    from: user,
    to: email,
    subject: subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${email}`);
};
