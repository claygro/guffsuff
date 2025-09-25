import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cookieParser from "cookie-parser";
import router from "./routes/user.routes.js";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io"; // FIXED
import MessageModels from "./models/message.models.js";

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("public/uploads"));
app.use("/chat", router);

// Socket.IO setup (attached to HTTP server)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on("join", (userid) => {
    socket.join(userid);
    console.log(`user ${userid} joined room`);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    try {
      const newMessage = await MessageModels.create({
        senderId,
        receiverId,
        text,
      });
      io.to(receiverId).emit("receiveMessage", newMessage);
      io.to(senderId).emit("receiveMessage", newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
});

server.listen(8000, async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("DB Connection error:", err);
  }
});
