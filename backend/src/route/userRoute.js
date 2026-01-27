import {
  register,
  getUserProfileById as getUserProfile,
  updateUserProfile,
  getAllUsers,
} from "../controller/userController.js";
import express from "express";
import { verifyJwt, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.use(verifyJwt);

router.route("/profile/:userId").get(getUserProfile).put(updateUserProfile);
router.get("/", getAllUsers);

export default router;
