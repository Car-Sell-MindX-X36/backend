// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import connectDB from "./configs/ConnectDB.js";

// Load .env
dotenv.config();

// Kết nối MongoDB
connectDB();

// Tạo Express app
const app = express();
app.use(cors());
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("🚗 Car Buy/Sell/Rent CRM API is running...");
});

// HTTP server (cần để dùng chung với socket.io)
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Realtime logic
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Example event
  socket.on("agent:newBooking", (data) => {
    console.log("📦 Booking received:", data);
    socket.broadcast.emit("admin:newBooking", data);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// Batch job: chạy mỗi đêm lúc 0h00
cron.schedule("0 0 * * *", () => {
  console.log("📆 Running daily batch job...");
  // TODO: logic tính doanh thu, cập nhật trạng thái thuê
});

// Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
