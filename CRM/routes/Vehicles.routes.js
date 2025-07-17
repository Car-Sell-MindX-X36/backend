import express from 'express';
import multer from 'multer';
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
} from '../controllers/Vehicle.controller.js';
import { protect, checkRole } from '../middlewares/authStaffs.middlewares.js';
import rateLimit from 'express-rate-limit';

const VehicleRouter = express.Router();

// ⚙️ Cấu hình multer để upload ảnh vào memory
const storage = multer.memoryStorage();
const upload = multer({ storage });
// 🚦 Giới hạn tần suất tạo xe
const createVehicleLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 20, // giới hạn 20 yêu cầu
  keyGenerator: (req) => req.staff._id.toString(), // Giới hạn theo ID nhân viên
  message: 'Bạn đã tạo quá nhiều xe. Vui lòng thử lại sau.'
});
// 🚗 Agent tạo xe (kèm ảnh)
VehicleRouter.post(
  '/',
  protect,
  checkRole(['agent']),
  upload.array('images'),
  createVehicleLimiter,
  createVehicle
);

// 📋 Cả agent và manager đều xem được
VehicleRouter.get('/', protect, checkRole(['agent', 'manager']), getAllVehicles);

// 🔍 Cả agent và manager đều xem chi tiết
VehicleRouter.get('/:id', protect, checkRole(['agent', 'manager']), getVehicleById);

// ✏️ Agent chỉnh sửa xe (có thể thêm ảnh)
VehicleRouter.patch(
  '/:id',
  protect,
  checkRole(['agent']),
  upload.array('images'), // 👈 thêm dòng này
  updateVehicle
);

// ❌ agent và manager đều có thể xóa xe
VehicleRouter.delete('/:id', protect, checkRole(['manager', 'agent']), deleteVehicle);

export default VehicleRouter;
