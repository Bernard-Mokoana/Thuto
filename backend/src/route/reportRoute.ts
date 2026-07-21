import express, { type Router } from "express";
import {
  averageGradePerCourse,
  submissionsPerLesson,
  topPerformingStudents,
} from "../controller/reportController.ts";
import { verifyJwt } from "../middleware/authMiddleware.ts";

const router: Router = express.Router();
router.use(verifyJwt);

router.get("/average-grade-per-course", averageGradePerCourse);
router.get("/submissions-per-lesson", submissionsPerLesson);
router.get("/top-performing-students", topPerformingStudents);

export default router;
