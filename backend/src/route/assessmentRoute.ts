import express, { type Router } from "express";
import {
  createAssessment,
  getAssessment,
  getAssessmentByLesson,
  updateAssessment,
  deleteAssessment,
} from "../controller/assessmentController.ts";
import {
  verifyJwt,
  tutorOnly,
  studentOnly,
} from "../middleware/authMiddleware.ts";

const router: Router = express.Router();

router.use(verifyJwt);

router.post("/", tutorOnly, createAssessment);
router.get("/lesson/:lessonId", getAssessmentByLesson);
router
  .route("/:id")
  .get(getAssessment)
  .put(tutorOnly, updateAssessment)
  .delete(tutorOnly, deleteAssessment);

export default router;
