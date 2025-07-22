import express from 'express';
import { authCustomer } from '../middlewares/authCustomers.middlewares.js';
import { createOrder } from '../controllers/Order.controller.js';
const OrdersRouter = express.Router();
OrdersRouter.post('/orders', authCustomer, createOrder);
export default OrdersRouter;