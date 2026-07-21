import express, { type Router } from "express";
import { checkCourseCompletion } from "../controller/progressController.ts";
import { verifyJwt } from "../middleware/authMiddleware.ts";

const router: Router = express.Router();

router.use(verifyJwt);

router.get("/check/:userId/:courseId", checkCourseCompletion);
router.get("/path/:userId/:pathId", checkCourseCompletion);

export default router;
