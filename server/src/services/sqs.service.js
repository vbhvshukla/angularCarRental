import AWS from "aws-sdk";
import { Bid } from "../models/bid.model.js";

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
          // Save the bid object to MongoDB
          const bid = new Bid(bidData);
          await bid.save();
          console.log("Bid saved to MongoDB:", bid);

          // Delete the message from SQS
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

