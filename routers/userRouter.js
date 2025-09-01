import express from "express";
import { createAdmin, createUser, deleteAdmin, getAdmins,getUser,googleLogin,LoginUser, resetPassword, sendOTP  } from "../controllers/userControllers.js";

const userRouter = express.Router();

userRouter.post("/",createUser);
userRouter.post("/create-admin",createAdmin)
userRouter.post("/login",LoginUser)
userRouter.post("/googlelogin",googleLogin)
userRouter.post("/send-otp",sendOTP)
userRouter.post("/reset-password",resetPassword) 
userRouter.get("/admins", getAdmins);
userRouter.delete("/admins/:email", deleteAdmin);
userRouter.get("/", getUser);

export default userRouter;