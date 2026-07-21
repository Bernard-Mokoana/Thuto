import express, { type Router } from "express";
import {
  generateCertificate,
  getCertificate,
  deleteCertificate,
} from "../controller/certificateController.ts";
import { verifyJwt, studentOnly } from "../middleware/authMiddleware.ts";

const router: Router = express.Router();
router.use(verifyJwt, studentOnly);

router.post("/generate/:userId/:courseId", generateCertificate);
router.post("/generate-path/:userId/:pathId", generateCertificate);
router.get("/:userId", getCertificate);
router.delete("/:id", deleteCertificate);

export default router;
