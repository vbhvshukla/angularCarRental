import dotenv from "dotenv";
import http from 'http';
import connectDb from "./config/db.config.js";
import { app } from "./app.js";
import { Worker } from "worker_threads";
import { initializeSocket } from "./services/socket.service.js";

/** Global Configuration :: dotENV */
dotenv.config({ path: ".env" });

const worker = new Worker("./src/utils/sqsWorker.utils.js");

/** DB Connection */
connectDb()
  .then(() => {
    //Create a socket.io server
    const server = http.createServer(app);
    const io = initializeSocket(server, app);

    server.listen(process.env.PORT || 8002, () => {
      console.log(`Server is running at port : ${process.env.PORT}`);
    });

    worker.on('message', (message) => {
      if (message === "done") {
        console.log("Main Thread :: Worker finished processing bids");
      }
      else if (message === "error") {
        console.error("Main Thead :: Worker encountered an error")
      }
    });

    worker.on("error", (error) => {
      console.error("Main Thead :: Worker Error : ", error);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Main Thread :: Worker stopped with exit code ${code}`);
      } else {
        console.log("Main Thread :: Worker exited successfully.");
      }
    });

    //explaination -> The SIGINT signal is sent to the process when the user interrupts it (e.g., by pressing Ctrl+C).
    process.on("SIGINT", () => {
      console.log("Main Thread: Terminating worker...");
      worker.postMessage("terminate");
      worker.terminate();
      process.exit(0);
    });

  })
  .catch((err) => {
    console.log("DB Connection Error :: ", err);
    process.exit(1);
  });
