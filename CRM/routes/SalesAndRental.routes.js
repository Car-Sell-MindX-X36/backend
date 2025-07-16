import {publishVehicle} from "../controllers/SalesAndRentalVehicles.controller.js";
import express from "express";
import { protect, checkRole } from "../middlewares/authStaffs.middlewares.js";
const SalesAndRentalRouter = express.Router();
// 🚗 Agent đăng bán xe
SalesAndRentalRouter.patch("/vehicles/:id/publish", protect, checkRole(["agent"]), publishVehicle);
export default SalesAndRentalRouter;
