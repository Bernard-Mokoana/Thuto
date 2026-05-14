import express from "express";
import {
  createSubmission,
  getSubmissionByLesson,
  getSubmissionById,
  updateSubmissionGrade,
  deleteSubmission,
} from "../controller/submissionController.js";
import {
  verifyJwt,
  studentOnly,
  tutorOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(verifyJwt);

router.post("/", studentOnly, createSubmission);
router.get("/lesson/:lessonId", tutorOnly, getSubmissionByLesson);
router.patch("/:id/grade", tutorOnly, updateSubmissionGrade);

router.route("/:id").get(getSubmissionById).delete(deleteSubmission);

export default router;
