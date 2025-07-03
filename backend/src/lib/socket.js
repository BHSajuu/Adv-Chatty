import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle video call events
  socket.on("initiate-call", (data) => {
    const { receiverId, callId, callerName, callerImage } = data;
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", {
        callId,
        callerName,
        callerImage,
        callerId: userId
      });
    }
  });

  socket.on("accept-call", (data) => {
    const { callId } = data;
    // Notify all participants that call was accepted
    socket.broadcast.emit("call-accepted", { callId });
  });

  socket.on("decline-call", (data) => {
    const { callId } = data;
    // Notify caller that call was declined
    socket.broadcast.emit("call-declined", { callId });
  });

  socket.on("end-call", (data) => {
    const { callId } = data;
    // Notify all participants that call ended
    socket.broadcast.emit("call-ended", { callId });
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };