import express from "express";
import { loginStaff, refreshAccessToken } from "../controllers/StaffsLogin.controllers.js";
import { protect, checkRole } from "../middlewares/authStaffs.middlewares.js";

const LoginStaffRouter = express.Router();

// 🔓 Đăng nhập
LoginStaffRouter.post("/", loginStaff);

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
