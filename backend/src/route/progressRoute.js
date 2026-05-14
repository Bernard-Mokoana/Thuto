import express from "express";
import { checkCourseCompletion } from "../controller/progressController.js";
import { verifyJwt } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyJwt);

router.get("/check/:userId/:courseId", checkCourseCompletion);

export default router;
