import express, { type Router, type Request, type Response, type NextFunction } from "express";
import {
  enrollInCourse,
  getUserEnrollments,
  markLessonComplete,
  deleteEnrollment,
} from "../controller/enrollmentController.ts";
import {
  verifyJwt,
  studentOnly,
  adminOnly,
} from "../middleware/authMiddleware.ts";

const router: Router = express.Router();

router.use(verifyJwt);

router.post("/enroll", studentOnly, enrollInCourse);
router.post("/paths/:pathId/enroll", studentOnly, (req: Request, res: Response, next: NextFunction) => {
  (req as any).body.pathId = req.params.pathId;
  return enrollInCourse(req, res, next);
});
router.get("/", getUserEnrollments);
router.get("/user/:userId", adminOnly, getUserEnrollments);
router.patch("/complete", markLessonComplete);
router.delete("/:id", adminOnly, deleteEnrollment);

export default router;
