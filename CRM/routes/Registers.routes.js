import { validateUserRegister } from "../middlewares/validate.middlewares.js";
import { createUser } from "../controllers/Users.controllers.js";
import express from "express";
import { fakeUser } from "../middlewares/fakeUser.js";
const RegisterRouter = express.Router();

RegisterRouter.post("/", fakeUser, validateUserRegister, createUser);
export default RegisterRouter;