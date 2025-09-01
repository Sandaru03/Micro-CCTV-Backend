// employeeRouter.js
import express from "express";
import { 
  createEmployee,
  getEmployees,
  updateEmployeeByEmail,
  deleteEmployeeByEmail
} from "../controllers/employeeControllers.js";

const employeeRouter = express.Router();

employeeRouter.post("/", createEmployee);
employeeRouter.get("/", getEmployees);
employeeRouter.put("/:email", updateEmployeeByEmail);
employeeRouter.delete("/:email", deleteEmployeeByEmail);

export default employeeRouter;
