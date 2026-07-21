import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config({
  path: ".env",
});

const app: Express = express();

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
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.get("/", (req, res) => {
  res.send("JWT Authentication API running...");
});

import courseRoute from "./route/courseRoute.ts";
import userRoute from "./route/userRoute.ts";
import statsRoute from "./route/statsRoutes.ts";
import lessonRoute from "./route/lessonRoute.ts";
import enrollmentRoute from "./route/enrollmentRoute.ts";
import submissionRoute from "./route/submissionRoute.ts";
import transactionRoute from "./route/transactionRoute.ts";
import assessmentRoute from "./route/assessmentRoute.ts";
import reportRoute from "./route/reportRoute.ts";
import certificateRoute from "./route/certificateRoute.ts";
import progressRoute from "./route/progressRoute.ts";
import authRoute from "./route/authRoute.ts";
import categoryRoute from "./route/categoryRoute.ts";

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

export default app;
