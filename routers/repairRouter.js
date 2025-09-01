import express from "express";
import { createReapair, getRepair, updateRepairById } from "../controllers/repairControllers.js";

const repairRouter = express.Router();

repairRouter.post("/",createReapair)
repairRouter.get("/",getRepair)
repairRouter.put("/:id", updateRepairById);

export default repairRouter