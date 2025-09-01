import express from "express";
import { createSupplier, deleteSupplierByEmail, getSupplier, loginSupplier, updateSupplierByEmail, sendPurchaseRequest } from "../controllers/supplierController.js";

const supplierRouter = express.Router();

supplierRouter.post("/", createSupplier);
supplierRouter.get("/", getSupplier);
supplierRouter.put("/:email", updateSupplierByEmail);
supplierRouter.delete("/:email", deleteSupplierByEmail);
supplierRouter.post("/login", loginSupplier);
supplierRouter.post("/:email/request", sendPurchaseRequest);

export default supplierRouter;