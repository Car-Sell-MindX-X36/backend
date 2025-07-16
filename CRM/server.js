import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import connectDB from "./configs/ConnectDB.js";
import RegisterStaffsRouter from "./routes/RegistersStaffs.routes.js";
import LoginStaffRouter from "./routes/LoginsStaffs.routes.js";
import RegisterCustomersRouter from "./routes/RegisterCustomers.routes.js";
import LoginCustomersRouter from "./routes/LoginCustomers.routes.js";
import VehiclesRouter from "./routes/Vehicles.routes.js";
import SalesAndRentalRouter from "./routes/SalesAndRental.routes.js";
// Load biến môi trường
dotenv.config();

// Kết nối MongoDB
connectDB();

// Tạo Express app
const app = express();

// ✅ Fix lỗi express-rate-limit khi deploy: tin proxy (Render, Vercel, Heroku,...)
app.set("trust proxy", 1);

// CORS setup
app.use(
  cors({
    origin: ["https://frontend-cw79.onrender.com", // domain FE thật sự
      "https://backup-fe.onrender.com", // domain FE backup
      "http://localhost:5173", // domain FE local
      "http://localhost:5174" // domain FE local khác
    ],
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("🚗 Car Buy/Sell/Rent CRM API is running...");
});

// Admin routes
app.use("/admin-registers", RegisterStaffsRouter);
app.use("/admin-login", LoginStaffRouter);
app.use("/admin-vehicles", VehiclesRouter);
app.use("/admin", SalesAndRentalRouter);


// Customer routes
app.use("/customer-registers", RegisterCustomersRouter);
app.use("/customer-login", LoginCustomersRouter);

// Tạo server HTTP để dùng được với socket.io
const server = http.createServer(app);

// Socket.io cấu hình
const io = new Server(server, {
  cors: {
    origin: "https://frontend-cw79.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Logic realtime
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("agent:newBooking", (data) => {
    console.log("📦 Booking received:", data);
    socket.broadcast.emit("admin:newBooking", data);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// Chạy batch job mỗi đêm
cron.schedule("0 0 * * *", () => {
  console.log("📆 Running daily batch job...");
  // TODO: logic doanh thu, cập nhật trạng thái thuê
});

// Khởi động server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
