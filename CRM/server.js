// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import connectDB from "./configs/ConnectDB.js";
import RegisterStaffsRouter from "./routes/RegistersStaffs.routes.js";
import LoginStaffRouter from "./routes/LoginsStaffs.routes.js";

// Load .env
dotenv.config();

// Kết nối MongoDB
connectDB();

// Tạo Express app
const app = express();

// CORS setup
app.use(
  cors({
    origin: "https://frontend-cw79.onrender.com", // chỉ cho phép FE thật sự
    credentials: true, // nếu dùng cookie/token thì cần dòng này
  })
);
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("🚗 Car Buy/Sell/Rent CRM API is running...");
});

// routes
app.use("/admin-registers", RegisterStaffsRouter);
app.use("/admin-login", LoginStaffRouter);

// HTTP server (cần để dùng chung với socket.io)
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "https://frontend-cw79.onrender.com", // match với FE
    methods: ["GET", "POST"],
    credentials: true,
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
