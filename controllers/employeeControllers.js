import Employee from "../models/employee.js";
import { isAdmin } from "./userControllers.js";

// Create Employee (Admin Only)
export async function createEmployee(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "Access denied. Admin Only.",
    });
  }

  const employee = new Employee(req.body);

  try {
    const response = await employee.save();
    res.json({
      message: "Employee Created Successfully",
      employee: response,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    return res.status(500).json({
      message: "Failed to create Employee",
    });
  }
}

// Get All Employees (Admin Only)
export async function getEmployees(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Access denied. Admin Only.",
      });
    }

    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({
      message: "Failed to fetch Employees",
    });
  }
}

// Update Employee by Email (Admin Only)
export async function updateEmployeeByEmail(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "Access denied. Admin Only.",
    });
  }

  const email = req.params.email;
  const updateData = { ...req.body };

  try {
    const updatedEmployee = await Employee.findOneAndUpdate(
      { email: email },
      updateData,
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json({
      message: "Employee Updated Successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({
      message: "Failed to update Employee",
    });
  }
}

// Delete Employee by Email (Admin Only)
export async function deleteEmployeeByEmail(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "Access denied. Admin Only.",
    });
  }

  const email = req.params.email;

  try {
    const deletedEmployee = await Employee.findOneAndDelete({ email: email });

    if (!deletedEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json({
      message: "Employee Deleted Successfully",
      employee: deletedEmployee,
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({
      message: "Failed to delete Employee",
    });
  }
}
