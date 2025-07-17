import {publishVehicle} from "../controllers/SalesAndRentalVehicles.controller.js";
import express from "express";
import { protect, checkRole } from "../middlewares/authStaffs.middlewares.js";
import rateLimit from "express-rate-limit";
// 🚦 Giới hạn tần suất đăng bán xe
const publishVehicleLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 20, // giới hạn 20 yêu cầu
  keyGenerator: (req) => req.staff._id.toString(), // Giới hạn theo ID nhân viên
  message: 'Bạn đã đăng bán quá nhiều xe. Vui lòng thử lại sau.'
});
const SalesAndRentalRouter = express.Router();
// 🚗 Agent đăng bán xe
SalesAndRentalRouter.patch("/vehicles/:id/publish", protect, checkRole(["agent"]), publishVehicleLimiter, publishVehicle);
export default SalesAndRentalRouter;
