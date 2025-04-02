import dotenv from "dotenv";
import { app } from "./app.js";
import connectDb from "./config/db.config.js";
import http from 'http';
import { Server } from 'socket.io';
import { processBids } from "./services/sqs.service.js";

/** Global Configuration :: dotENV */
dotenv.config({ path: ".env" });

/** DB Connection */
connectDb()
  .then(() => {
    //Create a socket.io server
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: 'http://127.0.0.1:5500',
        methods: ['GET', 'POST']
      }
    });

    // Set the io instance to be gobally be available for use
    app.set('io', io);

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      // Join the room which is the chatid in the conversation.
      socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat: ${chatId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
      });
    });


    server.listen(process.env.PORT || 8002, () => {
      console.log(`Server is running at port : ${process.env.PORT}`);
    });

    //Poll the aws queue for any new message || TODO -> Separate server pr chalao
    setInterval(processBids, 5000); // Poll every 5 seconds
  })
  .catch((err) => {
    console.log("DB Connection Error :: ", err);
  });
