import express from "express";
import {
  forgotPassword,
  login,
  resetPassword,
  refresh,
  logout,
  sendEmail,
  handleEmailVerification,
} from "../controller/AuthController.js";

const route = express.Router();

route.post("/login", login);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password", resetPassword);
route.get("/refresh", refresh);
route.post("/send-verification-email", sendEmail);
route.get("/verify-email", handleEmailVerification);
route.post("/logout", logout);
export default route;
