import express, { type Router } from "express";
import {
  createModule,
  getModulesByPath,
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  createLessonStep,
  getStepsByLesson,
} from "../controller/lessonController.ts";
import { verifyJwt, tutorOnly } from "../middleware/authMiddleware.ts";

const router: Router = express.Router();

router.use(verifyJwt);

router.route("/path/:pathId/modules").get(getModulesByPath).post(tutorOnly, createModule);
router.route("/module/:moduleId").get(getLessonsByCourse).post(tutorOnly, createLesson);
router.route("/:lessonId/steps").get(getStepsByLesson).post(tutorOnly, createLessonStep);

router
  .route("/course/:courseId")
  .get(getLessonsByCourse)
  .post(tutorOnly, createLesson);

router
  .route("/:id")
  .get(getLessonById)
  .put(tutorOnly, updateLesson)
  .delete(tutorOnly, deleteLesson);

export default router;
