import { validateStaffRegister } from "../middlewares/validateStaffs.middlewares.js";
import {createStaff } from "../controllers/StaffsRegister.controllers.js";
import express from "express";
import rateLimit from "express-rate-limit";
// Giới hạn số lần đăng ký trong một khoảng thời gian
const registerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 5, // Giới hạn tối đa 5 lần đăng ký
  message: "Quá nhiều lần đăng ký từ IP này, vui lòng thử lại sau.",
});
const RegisterStaffsRouter = express.Router();
RegisterStaffsRouter.post("/", validateStaffRegister, registerLimiter, createStaff);
export default RegisterStaffsRouter;