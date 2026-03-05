import express from "express";
import {
  createCategory,
  getAllCategories,
} from "../controller/categoryController.js";
import { adminOnly, verifyJwt } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", verifyJwt, adminOnly, createCategory);

export default router;
