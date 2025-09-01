// routes/technicianRouter.js
import express from "express";
import {
  loginTechnician,
  createTechnician,
  getTechnicians,
  updateTechnicianByEmail,
  deleteTechnicianByEmail,
} from "../controllers/technicianControllers.js";

const router = express.Router();

router.post("/login", loginTechnician);
router.post("/", createTechnician);
router.get("/", getTechnicians);
router.put("/:email", updateTechnicianByEmail);
router.delete("/:email", deleteTechnicianByEmail);

export default router;
