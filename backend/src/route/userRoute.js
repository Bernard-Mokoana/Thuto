import {
  register,
  getUserProfileById as getUserProfile,
  updateUserProfile,
  getAllUsers,
} from "../controller/userController.js";
import express from "express";
import { verifyJwt, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../utils/s3Config.utils.js";

const router = express.Router();

router.post("/register", upload.single("profileImage"), register);

router.use(verifyJwt);

router.route("/profile/:userId").get(getUserProfile).put(updateUserProfile);
router.get("/", getAllUsers);

export default router;
