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
} from "../controller/courseController.ts";
import express, { type Router } from "express";
import {
  adminOnly,
  verifyJwt,
  tutorOnly,
  tutorOrAdmin,
} from "../middleware/authMiddleware.ts";

const router: Router = express.Router();

router
  .route("/")
  .get(getCourse)
  .post(verifyJwt, tutorOnly, createCourse);

router.route("/tutor").get(verifyJwt, tutorOnly, getTutorCourses);
router.route("/tutor/:id").get(verifyJwt, tutorOrAdmin, getTutorCourseById);
router.route("/admin/all").get(verifyJwt, adminOnly, getAdminCourses);
router
  .route("/admin/:id/publish")
  .patch(verifyJwt, adminOnly, adminToggleCoursePublish);

router
  .route("/:id")
  .get(getCourseById)
  .put(verifyJwt, tutorOrAdmin, updateCourse)
  .delete(verifyJwt, tutorOrAdmin, deleteCourse);

export default router;
