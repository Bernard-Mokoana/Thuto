import express from "express";
import {
  forgotPassword,
  login,
  resetPassword,
  refresh,
  logout,
} from "../controller/AuthController.js";

const route = express.Router();

route.post("/login", login);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password", resetPassword);
route.get("/refresh", refresh);
rout.get("/email-password");
route.post("/logout", logout);

export default route;
