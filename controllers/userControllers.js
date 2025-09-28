import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";

dotenv.config();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// helper: admin guard
function ensureAdmin(req, res) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Forbidden: Admins only" });
    return false;
  }
  return true;
}

// Create User Signup
export function createUser(req, res) {
  const passwordHash = bcrypt.hashSync(req.body.password, 10);

  const userData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: passwordHash,
    role: "customer",
    phone: req.body.phone || "Not Given",
  };

  const user = new User(userData);

  user
    .save()
    .then(() => res.json({ message: "User Created Successfully" }))
    .catch(() => res.json({ message: "Failed to create user" }));
}

// Create Admin (Backend)
export function createAdmin(req, res) {
  const defaultPassword = "admin123";
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);

  const userData = {
    firstName: "Admin",
    lastName: "User",
    email: req.body.email,
    password: passwordHash,
    role: "admin",
    phone: "Not Given",
    isEmailVerified: true,
  };

  const user = new User(userData);

  user
    .save()
    .then(() =>
      res.json({ message: "Admin Created Successfully with default details" })
    )
    .catch((error) =>
      res.status(500).json({ message: "Failed to create admin", error })
    );
}

// login Users
export function LoginUser(req, res) {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) return res.status(404).json({ message: "User Not Found" });

      if (user.isBlock)
        return res
          .status(403)
          .json({ message: "Your account has been blocked. Please contact support." });

      const isPasswordCorrect = bcrypt.compareSync(password, user.password);

      if (isPasswordCorrect) {
        const token = jwt.sign(
          {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isBlock: user.isBlock,
            isEmailVerified: user.isEmailVerified,
            image: user.image,
          },
          process.env.JWT_SECRET
        );

        res.json({ token, message: "Login Successful", role: user.role });
      } else {
        res.status(403).json({ message: "Incorrect Password" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Login Failed", error: error.message });
    });
}

// isAdmin
export function isAdmin(req) {
  return req.user?.role === "admin";
}

// Google Login
export async function googleLogin(req, res) {
  const googleToken = req.body.token;

  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${googleToken}` } }
    );

    const userInfo = response.data;
    let user = await User.findOne({ email: userInfo.email });

    if (user) {
      if (user.isBlock)
        return res
          .status(403)
          .json({ message: "Your account has been blocked. Please contact support." });

      const token = jwt.sign(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isBlock: user.isBlock,
          isEmailVerified: user.isEmailVerified,
          image: user.image,
        },
        process.env.JWT_SECRET
      );

      return res.json({ token, message: "Login Successful", role: user.role });
    } else {
      const newUser = new User({
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        email: userInfo.email,
        role: "customer",
        isEmailVerified: true,
        image: userInfo.picture,
        password: "123",
      });

      const savedUser = await newUser.save();

      const token = jwt.sign(
        {
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role,
          isBlock: savedUser.isBlock,
          isEmailVerified: savedUser.isEmailVerified,
          image: savedUser.image,
        },
        process.env.JWT_SECRET
      );

      return res.json({
        token,
        message: "User Registered & Logged in Successfully",
        role: savedUser.role,
      });
    }
  } catch (error) {
    console.error("Error fetching Google user info:", error.message);
    return res.status(500).json({ message: "Google Login Failed", error: error.message });
  }
}

// OTP send 
export async function sendOTP(req, res) {
  const email = req.body.email;
  const otpCode = Math.floor(100000 + Math.random() * 900000);

  try {
    await OTP.deleteMany({ email });
    const newOTP = new OTP({ email, otp: otpCode });
    await newOTP.save();

    const message = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otpCode}`,
    };

    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.error("Error sending email details:", {
          message: error.message,
          code: error.code,
          stack: error.stack,
        });
        return res.status(500).json({
          message: "Failed to send OTP",
          error: {
            message: error.message,
            code: error.code,
            stack: error.stack,
          },
        });
      } else {
        console.log("Email sent successfully:", info.response);
        return res.json({ message: "OTP sent successfully" });
      }
    });
  } catch (e) {
    console.error("Error in OTP flow:", e);
    return res.status(500).json({
      message: "Failed to delete previous OTPs or save new OTP",
      error: e.message,
      stack: e.stack,
    });
  }
}

// Reset Password
export async function resetPassword(req, res) {
  const { email, newPassword, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(404).json({ message: "Invalid OTP" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });
    await OTP.deleteMany({ email });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reset password" });
  }
}

// Get All Admins
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Failed to load admins", error });
  }
};

// Delete admin by email
export const deleteAdmin = async (req, res) => {
  const { email } = req.params;

  try {
    const deleted = await User.findOneAndDelete({ email, role: "admin" });
    if (!deleted) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully", deleted });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete admin", error });
  }
};

// Current user profile
export function getUser(req, res) {
  if (!req.user?.email) return res.status(401).json({ message: "Unauthorized: No user data found in token" });

  User.findOne({ email: req.user.email })
    .then((user) => {
      if (!user) return res.status(404).json({ message: "User not found in database" });

      res.json({
        firstName: user.firstName || "Not Provided",
        lastName: user.lastName || "Not Provided",
        email: user.email || "Not Provided",
        phone: user.phone || "Not Provided",
        role: user.role || "customer",
        isEmailVerified: user.isEmailVerified || false,
        isBlock: user.isBlock || false,
        image: user.image || null,
        createdAt: user.createdAt,
      });
    })
    .catch((error) => res.status(500).json({ message: "Failed to fetch user details", error: error.message }));
}

/* Customers list + Block/Unblock (Admins only) */
export const getCustomers = async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const customers = await User.find({ role: "customer" })
      .select("firstName lastName email phone role isBlock isEmailVerified createdAt")
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Failed to load customers", error });
  }
};

export const setCustomerBlock = async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  const { email } = req.params;
  const { isBlock } = req.body;

  try {
    const updated = await User.findOneAndUpdate(
      { email, role: "customer" },
      { isBlock: !!isBlock },
      {
        new: true,
        projection: "firstName lastName email phone role isBlock isEmailVerified",
      }
    );

    if (!updated) return res.status(404).json({ message: "Customer not found" });

    res.json({
      message: updated.isBlock ? "Customer blocked" : "Customer unblocked",
      customer: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update block status", error });
  }
};
