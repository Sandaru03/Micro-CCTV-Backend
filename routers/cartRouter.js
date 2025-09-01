import express from "express";
import { getCart, addToCart, clearCart } from "../controllers/cartControllers.js";

const cartRouter = express.Router();

cartRouter.get("/", getCart);
cartRouter.post("/", addToCart);
cartRouter.delete("/", clearCart);

export default cartRouter;