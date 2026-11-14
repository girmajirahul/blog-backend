import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import { socketAuthMiddleware } from "./chat/sockets/socket.middleware.js";
import { initializeChatSocket } from "./chat/sockets/chat.socket.js";

const PORT = process.env.SOCKET_PORT || 5001;
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:4173",
  "https://blog-frontend-rahul.vercel.app",
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "").split(",").map((origin) => origin.trim()),
].filter(Boolean);

const app = express();
app.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "Blog Chat Socket.IO server is running." });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.use(socketAuthMiddleware);
initializeChatSocket(io);

async function startSocketServer() {
  try {
    await connectDB();
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Socket.IO chat server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Socket.IO server startup failed:", error);
    process.exit(1);
  }
}

startSocketServer();
