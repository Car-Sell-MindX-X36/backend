import { loginCustomer , refreshAccessToken } from "../controllers/CustomersLogin.controller.js";
import express from "express";
import rateLimit from "express-rate-limit";

// Giới hạn số lần đăng nhập trong một khoảng thời gian
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 5, // Giới hạn tối đa 5 lần đăng nhập
  message: "Quá nhiều lần đăng nhập từ IP này, vui lòng thử lại sau.",
});

const LoginCustomersRouter = express.Router();

LoginCustomersRouter.post("/", loginLimiter, loginCustomer);
LoginCustomersRouter.post("/refresh-token", refreshAccessToken);

export default LoginCustomersRouter;
