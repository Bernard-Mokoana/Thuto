import express from "express";
import {
  generateCertificate,
  getCertificate,
  deleteCertificate,
} from "../controller/certificateController.js";
import { verifyJwt, studentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(verifyJwt, studentOnly);

router.post("/generate/:userId/:courseId", generateCertificate);
router.get("/:userId", getCertificate);
router.delete("/:id", deleteCertificate);

export default router;
