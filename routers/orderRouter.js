import express from "express";
import { createOrder, getOrders, updateOrder } from "../controllers/orderControllers.js";

const orderRouter = express.Router();

orderRouter.post("/",createOrder)
orderRouter.get("/:page/:limit",getOrders)
orderRouter.put("/:id",updateOrder)

export default orderRouter;