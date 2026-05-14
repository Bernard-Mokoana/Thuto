import express from "express";
import {
  createAssessment,
  getAssessment,
  getAssessmentByLesson,
  updateAssessment,
  deleteAssessment,
} from "../controller/assessmentController.js";
import {
  verifyJwt,
  tutorOnly,
  studentOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyJwt);

router.post("/", tutorOnly, createAssessment);
router
  .route("/:id")
  .get(studentOnly, tutorOnly, getAssessment)
  .put(tutorOnly, updateAssessment)
  .delete(tutorOnly, deleteAssessment);
router.get("/:lessonId", studentOnly, getAssessmentByLesson);

export default router;
