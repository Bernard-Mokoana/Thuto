import express from "express";
import {
  createTransactions,
  getAllTransactions,
  getUserTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controller/transactionController.js";
import { verifyJwt, studentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyJwt);

router.route("/").post(createTransactions).get(getAllTransactions);

router.get("/user/:userId", getUserTransactions);
router.put("/:id/status", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
