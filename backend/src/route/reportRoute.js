import express from "express";
import {
  averageGradePerCourse,
  submissionsPerLesson,
  topPerformingStudents,
} from "../controller/reportController.js";
import { verifyJwt } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(verifyJwt);

router.get("/average-grade-per-course", averageGradePerCourse);
router.get("/submissions-per-lesson", submissionsPerLesson);
router.get("/top-performing-students", topPerformingStudents);

export default router;
