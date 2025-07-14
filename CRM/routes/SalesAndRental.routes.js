import { postSaleVehicle, postRentalVehicle } from "../controllers/SalesAndRentalVehicles.controller.js";
import express from "express";
import { protect, checkRole } from "../middlewares/authStaffs.middlewares.js";
const SalesAndRentalRouter = express.Router();
// 🚗 Agent đăng bán xe
SalesAndRentalRouter.post("/sales", protect, checkRole(["agent"]), postSaleVehicle);
// 🚗 Agent đăng cho thuê xe
SalesAndRentalRouter.post("/rentals", protect, checkRole(["agent"]), postRentalVehicle);
export default SalesAndRentalRouter;