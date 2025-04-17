import { Server } from 'socket.io';

export const initializeSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://127.0.0.1:5500',
      methods: ['GET', 'POST']
    }
  });

  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  return io;
};