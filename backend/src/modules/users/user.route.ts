import {
  register,
  getUserProfileById as getUserProfile,
  getAllUsers,
  updateUserProfile,
  updateUserRoleByAdmin,
  deleteOwnAccount,
  deleteUserByAdmin,
} from "./user.controller";
import express, { type Router } from "express";
import { verifyJwt, adminOnly } from "../../middleware/authMiddleware";
import { upload } from "../../config/s3Config.utils";

const router: Router = express.Router();

router.post("/register", upload.single("profileImage"), register);

router.use(verifyJwt);

router
  .route("/profile/:userId")
  .get(getUserProfile)
  .put(upload.single("profileImage"), updateUserProfile);
router.delete("/me", deleteOwnAccount);

router.get("/", adminOnly, getAllUsers);
router.patch("/:id/role", adminOnly, updateUserRoleByAdmin);
router.delete("/:id", adminOnly, deleteUserByAdmin);

export default router;
