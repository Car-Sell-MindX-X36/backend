import express from 'express';
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
} from '../controllers/Vehicle.controller.js';
import { protect, checkRole } from '../middlewares/authStaffs.middlewares.js';

const VehicleRouter = express.Router();

// 🚗 Agent tạo xe
VehicleRouter.post('/', protect, checkRole(['agent']), createVehicle);

// 📋 Cả agent và manager đều xem được
VehicleRouter.get('/', protect, checkRole(['agent', 'manager']), getAllVehicles);

// 🔍 Cả agent và manager đều xem chi tiết
VehicleRouter.get('/:id', protect, checkRole(['agent', 'manager']), getVehicleById);

// ✏️ Agent chỉnh sửa xe
VehicleRouter.patch('/:id', protect, checkRole(['agent']), updateVehicle);

// ❌ agent và manager đều có thể xóa xe
VehicleRouter.delete('/:id', protect, checkRole(['manager', 'agent']), deleteVehicle);

export default VehicleRouter;
