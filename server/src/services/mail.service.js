import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (email, name, bidAmount) => {
  const mailOptions = {
    from: '"Car Rental App" <no-reply@carrental.com>',
    to: email,
    subject: "Bid Created Successfully",
    text: `Hi ${name},\n\nYour bid of $${bidAmount} has been successfully placed.\n\nThanks,\nCar Rental Team`,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${email}`);
};
