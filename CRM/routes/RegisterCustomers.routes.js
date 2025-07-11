import {validateCustomerRegister} from "../middlewares/validateCustomers.middlewares.js";
import {RegisterCustomers} from "../controllers/CustomersRegister.controller.js";
import express from "express";
import rateLimit from "express-rate-limit";
// Giới hạn số lần đăng ký trong một khoảng thời gian
const registerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 5, // Giới hạn tối đa 5 lần đăng ký
  message: "Quá nhiều lần đăng ký từ IP này, vui lòng thử lại sau.",
});
const RegisterCustomersRouter = express.Router();
RegisterCustomersRouter.post("/", validateCustomerRegister, registerLimiter, RegisterCustomers);
export default RegisterCustomersRouter;