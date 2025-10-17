import express from "express";
import {
  forgotPassword,
  login,
  resetPassword,
  register,
} from "../controller/AuthController.js";

const route = express.Router();

route.post("/login", login);
route.post("/register", register);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password", resetPassword);

export default route;
