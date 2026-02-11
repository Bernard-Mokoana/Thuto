import {
  createCourse,
  getCourse,
  getTutorCourses,
  getTutorCourseById,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controller/courseController.js";
import express from "express";
import {
  verifyJwt,
  tutorOnly,
  studentOnly,
  tutorOrAdmin,
} from "../middleware/authMiddleware.js";
import { upload } from "../utils/s3Config.utils.js";

const router = express.Router();

router
  .route("/")
  .get(getCourse)
  .post(verifyJwt, tutorOrAdmin, upload.single("thumbnail"), createCourse);

router.route("/tutor").get(verifyJwt, tutorOnly, getTutorCourses);
router
  .route("/tutor/:id")
  .get(verifyJwt, tutorOnly, getTutorCourseById);

router
  .route("/:id")
  .get(getCourseById)
  .put(verifyJwt, tutorOnly, upload.single("thumbnail"), updateCourse)
  .delete(verifyJwt, tutorOnly, deleteCourse);

export default router;
