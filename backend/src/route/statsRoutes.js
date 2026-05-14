import express from "express";
import {
  getPopularCourses,
  getTutorEarnings,
  getStudentProgress,
  getMonthlyRevenue,
  getCourseCategoryStats,
  getTopTutorsThisMonth,
} from "../controller/statsController.js";
import { verifyJwt } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(verifyJwt);

router.get("/popular-courses", getPopularCourses);
router.get("/tutor-earnings", getTutorEarnings);
router.get("/student-progress", getStudentProgress);
router.get("/monthly-revenue", getMonthlyRevenue);
router.get("/category-stats", getCourseCategoryStats);
router.get("/top-tutors", getTopTutorsThisMonth);

export default router;
