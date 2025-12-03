import express from "express";
import {
  enrollInCourse,
  getUserEnrollments,
  markLessonComplete,
  deleteEnrollment,
} from "../controller/enrollmentController.js";
import {
  verifyJwt,
  studentOnly,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyJwt);

router.post("/enroll", studentOnly, enrollInCourse);
router.get("/", getUserEnrollments);
router.get("/user/:userId", adminOnly, studentOnly, getUserEnrollments);
router.patch("/complete", markLessonComplete);
router.delete("/:id", adminOnly, deleteEnrollment);

export default router;
