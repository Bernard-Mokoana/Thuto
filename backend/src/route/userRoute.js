import {
  register,
  getUserProfileById as getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserRoleByAdmin,
  deleteUserByAdmin,
  deleteOwnAccount,
} from "../controller/userController.js";
import express from "express";
import { verifyJwt, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

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
