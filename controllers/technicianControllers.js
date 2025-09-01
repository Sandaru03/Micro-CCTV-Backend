// controllers/technicianControllers.js
import bcrypt from "bcrypt";
import Technician from "../models/technician.js";
import { isAdmin } from "./userControllers.js";

/**
 * ✅ DEV-ONLY Technician Login (no JWT)
 * POST /technicians/login
 * body: { email, password }
 * resp: { token: "dev-tech-token", technician }
 *
 * NOTE:
 * - PRODUCTION එකට මේක හරි නෑ. මෙක local/dev usage පමණයි.
 * - Frontend needs a "token", so we return a static one.
 */
export async function loginTechnician(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email සහ Password දෙකම අත්‍යවශ්‍යයි" });
    }

    // If your schema uses select:false for password, keep +password.
    const tech = await Technician.findOne({ email }).select("+password");
    if (!tech) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, tech.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const obj = tech.toObject ? tech.toObject() : { ...tech };
    delete obj.password;

    return res.json({
      message: "Technician login successful (DEV)",
      token: "dev-tech-token", // static token for local/dev
      technician: obj,
    });
  } catch (error) {
    console.error("DEV login error:", error);
    return res.status(500).json({ message: "Login failed. Please try again." });
  }
}

/**
 * Create Technician (Admin Only)
 * POST /technicians
 * If no password given, defaults to "tech123".
 */
export async function createTechnician(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Access denied. Admin Only." });
    }

    const {
      firstName,
      lastName,
      email,
      phone = "Not Given",
      salary,
      speciality = "",
      password,
    } = req.body;

    const rawPw = password && String(password).trim().length > 0 ? password : "tech123";
    const passwordHash = bcrypt.hashSync(rawPw, 10);

    const tech = new Technician({
      firstName,
      lastName,
      email,
      phone,
      salary,
      speciality,
      password: passwordHash,
    });

    const saved = await tech.save();
    const obj = saved.toObject();
    delete obj.password;

    return res.json({
      message: "Technician Created Successfully",
      technician: obj,
      defaultPassword: rawPw === "tech123" ? "tech123" : undefined, // remove in prod if not needed
    });
  } catch (error) {
    console.error("Error creating technician:", error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    return res.status(500).json({ message: "Failed to create Technician" });
  }
}

/**
 * Get All Technicians (Admin Only)
 * GET /technicians
 */
export async function getTechnicians(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Access denied. Admin Only." });
    }
    const techs = await Technician.find().select("-password");
    return res.json(techs);
  } catch (error) {
    console.error("Error fetching technicians:", error);
    return res.status(500).json({ message: "Failed to fetch Technicians" });
  }
}

/**
 * Update Technician by Email (Admin Only)
 * PUT /technicians/:email
 */
export async function updateTechnicianByEmail(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Access denied. Admin Only." });
    }

    const email = req.params.email;
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = bcrypt.hashSync(updateData.password, 10);
    }

    const updated = await Technician.findOneAndUpdate(
      { email },
      updateData,
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Technician not found" });
    }

    return res.json({
      message: "Technician Updated Successfully",
      technician: updated,
    });
  } catch (error) {
    console.error("Error updating technician:", error);
    return res.status(500).json({ message: "Failed to update Technician" });
  }
}

/**
 * Delete Technician by Email (Admin Only)
 * DELETE /technicians/:email
 */
export async function deleteTechnicianByEmail(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Access denied. Admin Only." });
    }

    const email = req.params.email;
    const deleted = await Technician.findOneAndDelete({ email });

    if (!deleted) {
      return res.status(404).json({ message: "Technician not found" });
    }

    const obj = deleted.toObject ? deleted.toObject() : { ...deleted };
    delete obj.password;

    return res.json({
      message: "Technician Deleted Successfully",
      technician: obj,
    });
  } catch (error) {
    console.error("Error deleting technician:", error);
    return res.status(500).json({ message: "Failed to delete Technician" });
  }
}
