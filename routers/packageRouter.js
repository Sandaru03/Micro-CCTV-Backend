import express from "express";
import { createPackage, deletePackageById, dropAccessoryIndex, getPackage, updatePackageById } from "../controllers/packageControllers.js";

const packageRouter = express.Router();

packageRouter.post("/",createPackage)
packageRouter.get("/",getPackage)
packageRouter.put("/:packageId",updatePackageById)
packageRouter.delete("/:packageId",deletePackageById)
packageRouter.delete("/drop-index", dropAccessoryIndex)

export default packageRouter