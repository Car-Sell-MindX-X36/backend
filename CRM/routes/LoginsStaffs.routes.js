import express from "express";
import { loginStaff, refreshAccessToken } from "../controllers/StaffsLogin.controllers.js";
import { protect, checkRole } from "../middlewares/authStaffs.middlewares.js";
import rateLimit from "express-rate-limit";
// Giới hạn số lần đăng ký trong một khoảng thời gian
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 5, // Giới hạn tối đa 5 lần đăng nhập
  message: "Quá nhiều lần đăng nhập từ IP này, vui lòng thử lại sau.",
});
const LoginStaffRouter = express.Router();

// 🔓 Đăng nhập
LoginStaffRouter.post("/", loginLimiter, loginStaff);

// 🔁 Refresh token
LoginStaffRouter.post("/refresh-token", refreshAccessToken);

// 🔐 Route chỉ manager được vào
LoginStaffRouter.get(
  "/manager",
  protect,
  checkRole(["manager"]),
  (req, res) => {
    res.status(200).json({ message: "Hello Manager 👑", staff: req.staff });
  }
);

export default LoginStaffRouter;
