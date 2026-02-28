import express from "express";
import {
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../controller/lessonController.js";
import { verifyJwt, tutorOnly } from "../middleware/authMiddleware.js";
import { upload } from "../utils/s3Config.utils.js";

const router = express.Router();

router.use(verifyJwt);

router
  .route("/course/:courseId")
  .get(getLessonsByCourse)
  .post(
    tutorOnly,
    upload.fields([
      { name: "video", maxCount: 1 },
      { name: "materials", maxCount: 10 },
    ]),
    createLesson
  );

router
  .route("/:id")
  .get(getLessonById)
  .put(
    tutorOnly,
    upload.fields([
      { name: "video", maxCount: 1 },
      { name: "materials", maxCount: 10 },
    ]),
    updateLesson
  )
  .delete(tutorOnly, deleteLesson);

export default router;
