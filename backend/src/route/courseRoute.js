import {
  createCourse,
  getCourse,
  getTutorCourses,
  getTutorCourseById,
  getCourseById,
  updateCourse,
  deleteCourse,
  getAdminCourses,
  adminToggleCoursePublish,
} from "../controller/courseController.js";
import express from "express";
import {
  adminOnly,
  verifyJwt,
  tutorOnly,
  tutorOrAdmin,
} from "../middleware/authMiddleware.js";
import { upload } from "../utils/s3Config.utils.js";

const router = express.Router();

router
  .route("/")
  .get(getCourse)
  .post(verifyJwt, tutorOnly, upload.single("thumbnail"), createCourse);

router.route("/tutor").get(verifyJwt, tutorOnly, getTutorCourses);
router.route("/tutor/:id").get(verifyJwt, tutorOrAdmin, getTutorCourseById);
router.route("/admin/all").get(verifyJwt, adminOnly, getAdminCourses);
router
  .route("/admin/:id/publish")
  .patch(verifyJwt, adminOnly, adminToggleCoursePublish);

router
  .route("/:id")
  .get(getCourseById)
  .put(verifyJwt, tutorOrAdmin, upload.single("thumbnail"), updateCourse)
  .delete(verifyJwt, tutorOrAdmin, deleteCourse);

export default router;
