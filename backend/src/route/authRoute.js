import express from "express";
import {
  forgotPassword,
  login,
  resetPassword,
  register,
} from "../controller/AuthController.js";
import { getUserProfile } from "../controller/userController.js";
import { verifyJwt } from "../middleware/authMiddleware.js";

const route = express.Router();

route.post("/login", login);
route.post("/register", register);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password", resetPassword);

route.use(verifyJwt);
route.get("/profile", getUserProfile);

export default route;
