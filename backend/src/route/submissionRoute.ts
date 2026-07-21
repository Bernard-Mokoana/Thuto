import express, { type Router } from "express";
import {
  createSubmission,
  getSubmissionByLesson,
  getSubmissionById,
  updateSubmissionGrade,
  deleteSubmission,
} from "../controller/submissionController.ts";
import {
  verifyJwt,
  studentOnly,
  tutorOnly,
} from "../middleware/authMiddleware.ts";

const router: Router = express.Router();
router.use(verifyJwt);

router.post("/", studentOnly, createSubmission);
router.post("/attempt", studentOnly, createSubmission);
router.get("/lesson/:lessonId", tutorOnly, getSubmissionByLesson);
router.patch("/:id/grade", tutorOnly, updateSubmissionGrade);

router.route("/:id").get(getSubmissionById).delete(deleteSubmission);

export default router;
