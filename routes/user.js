import express from "express";
import { validator } from "../middlewares/validator.js";
import {
  forgotPasswordValidation,
  loginAdminValidation,
  registerUserGmailValidation,
  registerUserValidation,
} from "../config/validation.js";
import {
  forgotPassword,
  getUsers,
  loginUser,
  registerUser,
  registerUserGmail,
  resetPassword,
  updatePasswordAndPin,
  updateUserDetails,
  verifyEmail,
} from "../controllers/user.js";
import authUser from "../middlewares/authUser.js";

const userRouter = express.Router();

userRouter.post("/register", validator([registerUserValidation]), registerUser);
userRouter.post(
  "/gmail/register",
  validator([registerUserGmailValidation]),
  registerUserGmail
);
userRouter.post("/login", validator([loginAdminValidation]), loginUser);
userRouter.get("/users", authUser, getUsers);
// Forgot & Reset Password Routes
userRouter.post(
  "/forgot-password",
  validator([forgotPasswordValidation]),
  forgotPassword
);
userRouter.post("/reset-password/:token", resetPassword);
userRouter.get("/verify-email/:token", verifyEmail);

export default userRouter;
