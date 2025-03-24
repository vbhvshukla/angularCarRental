import AWS from "aws-sdk";
import { sendEmail } from "./mail.service.js";

//SQS Config
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const sqs = new AWS.SQS();
const QUEUE_URL = process.env.SQS_QUEUE_URL;

export const pollQueue = () => {
  const params = { QueueUrl: QUEUE_URL, MaxNumberOfMessages: 1 };

  //Recieve message from SQS
  sqs.receiveMessage(params, async (err, data) => {
    //IF any error occurs while receiving it will retry in 5 seconds later
    if (err) console.error("Error receiving message:", err);

    //If we have the message
    if (data.Messages.length > 0) {
      //As we had the array of message there so we get a array here and we are saving the message body as an object.
      const MessageBody = JSON.parse(data.Messages[0].Body);
      console.log("Received message:", MessageBody);
      try {
        // Send confirmation email
        await sendEmail(
          MessageBody.email,
          `New bid placed on car ${MessageBody.carName} `,
          `New Bid Placed at INR ${MessageBody.bidAmount} 
          from ${MessageBody.startDate} to ${MessageBody.endDate} 
          by ${MessageBody.username}.`
        );

        // Delete message from queue after processing
        await sqs
          .deleteMessage({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: data.Messages[0].ReceiptHandle,
          })
          .promise();
        console.log("Message processed and deleted.");
      } catch (error) {
        console.error("Failed to process message:", error);
      }
    }
  });
};
