import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const sqs = new AWS.SQS();
const QUEUE_URL = process.env.SQS_QUEUE_URL;

export const sendMessageToSQS = async (messageBody) => {
  try {
    const params = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(messageBody),
    };

    const result = await sqs.sendMessage(params).promise();
    console.log("SQS Producer :: Message sent to SQS:", result);
    return result;
  } catch (error) {
    console.error("SQS Producer :: Error sending message to SQS", error);
    throw new Error("Failed to send message to SQS");
  }
};