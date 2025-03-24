import dotenv from "dotenv";
import { app } from "./app.js";
import connectDb from "./config/db.config.js";
import { pollQueue } from "./services/sqs.service.js";
import http from 'http';
import { Server } from 'socket.io';

/** Global Configuration :: dotENV */
dotenv.config({ path: ".env" });

/** DB Connection */
connectDb()
  .then(() => {
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: 'http://127.0.0.1:5500', // Adjust this to match your client URL
        methods: ['GET', 'POST']
      }
    });

    // Store the Socket.IO instance in the app for use in controllers
    app.set('io', io);

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      // Join a specific chat room
      socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat: ${chatId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
      });
    });

    // Replace `app.listen` with `server.listen`
    server.listen(process.env.PORT || 8002, () => {
      console.log(`Server is running at port : ${process.env.PORT}`);
    });

    //Poll the aws queue for any new message
    setInterval(pollQueue, 5000);
  })
  .catch((err) => {
    console.log("DB Connection Error :: ", err);
  });
