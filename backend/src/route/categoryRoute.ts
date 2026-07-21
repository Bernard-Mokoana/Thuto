import express, { type Router } from "express";
import {
  createCategory,
  getAllCategories,
} from "../controller/categoryController.ts";
import { adminOnly, verifyJwt } from "../middleware/authMiddleware.ts";

const router: Router = express.Router();

router.get("/", getAllCategories);
router.post("/", verifyJwt, adminOnly, createCategory);

export default router;
