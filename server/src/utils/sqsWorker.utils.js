import { parentPort } from "worker_threads";
import { processBids } from "../services/sqsConsumer.service.js";
import connectDb from "../config/db.config.js";

connectDb()
  .then(() => console.log("Worker ::  Connected to MongoDB"))
  .catch((err) => {
    console.error("Worker :: MongoDB connection error:", err);
    process.exit(1);
  });

const POLL_INTERVAL = 5000;

const pollQueue = async () => {
    try {
        console.log("Worker :: Polling SQS queue...");
        await processBids();
        console.log("Worker :: Finished processing SQS messages.");
    } catch (error) {
        console.error("Worker :: Error processing SQS messages:", error);
    } finally {
        // Schedule the next poll
        setTimeout(pollQueue, POLL_INTERVAL);
    }
};

// Start polling when the worker thread starts
pollQueue();

// Listen for termination signal from the main thread
parentPort.on("message", (message) => {
    if (message === "terminate") {
        console.log("Worker :: Termination signal received. Stopping worker...");
        process.exit(0);
    }
});