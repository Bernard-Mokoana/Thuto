import express, { type Router } from "express";
import {
  forgotPassword,
  login,
  resetPassword,
  refresh,
  logout,
  sendEmail,
  handleEmailVerification,
} from "./auth.controller";
import { verifyJwt } from "../../middleware/authMiddleware";

const route: Router = express.Router();

route.post("/login", login);
route.post("forgot-password", forgotPassword);
route.post("/reset-password", resetPassword);
route.post("/send-verification-email", verifyJwt, sendEmail);
route.post("logout", logout);

route.get("refresh", refresh);
route.get("verify-email", handleEmailVerification);

export default route;
