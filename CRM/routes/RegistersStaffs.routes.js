import { validateStaffRegister } from "../middlewares/validateStaffs.middlewares.js";
import {createStaff } from "../controllers/StaffsRegister.controllers.js";
import express from "express";
const RegisterStaffsRouter = express.Router();

RegisterStaffsRouter.post("/", validateStaffRegister, createStaff);
export default RegisterStaffsRouter;