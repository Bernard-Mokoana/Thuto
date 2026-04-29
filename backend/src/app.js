import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config({
  path: ".env",
});

const app = express();

const proxyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import healthRoute from "./route/healthcheckRoute.js";
import courseRoute from "./route/courseRoute.js";
import userRoute from "./route/userRoute.js";
import statsRoute from "./route/statsRoutes.js";
import lessonRoute from "./route/lessonRoute.js";
import enrollmentRoute from "./route/enrollmentRoute.js";
import submissionRoute from "./route/submissionRoute.js";
import transactionRoute from "./route/transactionRoute.js";
import assessmentRoute from "./route/assessmentRoute.js";
import reportRoute from "./route/reportRoute.js";
import certificateRoute from "./route/certificateRoute.js";
import progressRoute from "./route/progressRoute.js";
import authRoute from "./route/authRoute.js";
import categoryRoute from "./route/categoryRoute.js";
import { errorHandler } from "./middleware/error.middleware.js";

app.use("/api/v1/healthcheck", healthRoute);
app.use("/api/v1/courses", courseRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/stats", statsRoute);
app.use("/api/v1/lessons", lessonRoute);
app.use("/api/v1/enrollments", enrollmentRoute);
app.use("/api/v1/submission", submissionRoute);
app.use("/api/v1/transaction", transactionRoute);
app.use("/api/v1/assessments", assessmentRoute);
app.use("/api/v1/reports", reportRoute);
app.use("/api/v1/certificates", certificateRoute);
app.use("/api/v1/progress", progressRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/categories", categoryRoute);

app.use(errorHandler);

export default app;
