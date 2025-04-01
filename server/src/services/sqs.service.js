import AWS from "aws-sdk";
import { Bid } from "../models/bid.model.js";
import dotenv from "dotenv";
import { sendEmail } from "./mail.service.js";

dotenv.config({ path: ".env" })

// SQS configuration
AWS.config.update({
  accessKeyId: 'AKIAXYKJRBXVYAW2OYOF',
  secretAccessKey: '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',
  region: 'us-east-1'
});

const sqs = new AWS.SQS();
const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/533267025387/carental';

export const processBids = async () => {
  const params = { QueueUrl: QUEUE_URL, MaxNumberOfMessages: 10 };

  try {
    const data = await sqs.receiveMessage(params).promise();

    if (data.Messages && data.Messages.length > 0) {
      for (const message of data.Messages) {
        const bidData = JSON.parse(message.Body);
        console.log('Bid data:: ', bidData);
        try {
          // save the bid object to MongoDB
          const bid = new Bid(bidData);
          await bid.save();
          // Send email notification
          await sendEmail({
            to: bid.user.email,
            subject: "Bid Placed Successfully",
            text: `Dear ${bid.user.username},\n\nYour bid for the car "${bid.car.carName}" has been placed successfully.\n\nDetails:\n- Rental Type: ${bid.rentalType}\n- Bid Amount: ${bid.bidAmount}\n- Start Date: ${bid.fromTimestamp}\n- End Date: ${bid.toTimestamp}\n\nThank you for using our service!\n\nBest regards,\nCar Rental Team`,
          });
          // Send email notification
          await sendEmail({
            to: bid.car.owner.email,
            subject: "Carental - New Bid Placed",
            text: `Dear ${bid.car.owner.username},\n\nNew Bid for the car "${bid.car.carName}" has been placed.\n\nDetails:\n- Rental Type: ${bid.rentalType}\n- Bid Amount: ${bid.bidAmount}\n- Start Date: ${bid.fromTimestamp}\n- End Date: ${bid.toTimestamp}\n\nPlease accept or reject it for a smoother experience. \n \nThank you for using our service!\n\nBest regards,\nCar Rental Team`,
          });
          console.log("Bid saved to MongoDB:", bid);

          // delete the message from SQS
          await sqs
            .deleteMessage({
              QueueUrl: QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle,
            })
            .promise();
          console.log("Message deleted from SQS");
        } catch (error) {
          console.error("Error saving bid to MongoDB:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error processing SQS messages:", error);
  }
};

