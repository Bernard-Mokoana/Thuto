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

router.use(verifyJwt);

router
  .route("/")
  .post(tutorOrAdmin, upload.single("thumbnail"), createCourse)
  .get(getCourse);

router.route("/tutor").get(tutorOnly, getTutorCourses);
router.route("/tutor/:id").get(tutorOnly, getTutorCourseById);

router
  .route("/:id")
  .get(studentOnly, getCourseById)
  .put(tutorOnly, upload.single("thumbnail"), updateCourse)
  .delete(tutorOnly, deleteCourse);

export default router;
