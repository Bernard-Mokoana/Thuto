import express, { type Router } from "express";
import {
  getPopularCourses,
  getTutorEarnings,
  getStudentProgress,
  getMonthlyRevenue,
  getCourseCategoryStats,
  getTopTutorsThisMonth,
  getTaskAccuracy,
} from "../controller/statsController.ts";
import { verifyJwt } from "../middleware/authMiddleware.ts";

const router: Router = express.Router();
router.use(verifyJwt);

router.get("/popular-courses", getPopularCourses);
router.get("/tutor-earnings", getTutorEarnings);
router.get("/student-progress", getStudentProgress);
router.get("/monthly-revenue", getMonthlyRevenue);
router.get("/category-stats", getCourseCategoryStats);
router.get("/top-tutors", getTopTutorsThisMonth);
router.get("/task-accuracy", getTaskAccuracy);

export default router;
