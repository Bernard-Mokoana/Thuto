import {
  register,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
} from "../controller/userController.js";
import express from "express";
import { verifyJwt, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.use(verifyJwt);

router.route("/profile").get(getUserProfile).put(updateUserProfile);
router.get("/", adminOnly, getAllUsers);

export default router;
