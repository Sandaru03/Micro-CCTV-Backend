// server/models/technician.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const technicianSchema = new Schema(
  {
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, required: true },           // hashed in controller
    phone:      { type: String, default: "Not Given" },     // keep String to match your Employee setup
    salary:     { type: String, required: true },           // (or Number if you prefer)
    speciality: { type: String, default: "" },              // ✅ has type
    isActive:   { type: Boolean, default: true }
  },
  { timestamps: true }                                      // ✅ only valid Schema options here
);

export default model("technicians", technicianSchema);
