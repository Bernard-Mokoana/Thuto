import express, { type Router } from "express";
import {
  createTransactions,
  getAllTransactions,
  getUserTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controller/transactionController.ts";
import { verifyJwt, studentOnly } from "../middleware/authMiddleware.ts";

const router: Router = express.Router();

router.use(verifyJwt);

router.route("/").post(createTransactions).get(getAllTransactions);

router.get("/user/:userId", getUserTransactions);
router.put("/:id/status", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
