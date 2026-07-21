import { task } from "../model/task.ts";
import { taskAttempt } from "../model/taskAttempt.ts";
import { lessonStep } from "../model/lessonStep.ts";
import { learningLesson } from "../model/learningLesson.ts";
import { learningModule } from "../model/learningModule.ts";
import { userProgress } from "../model/userProgress.ts";
import { userGamification } from "../model/userGamification.ts";
import type { PopulatedStepRef } from "../types/types.ts";

const normalizeAnswer = (value) => {
  if (Array.isArray(value))
    return value
      .map(String)
      .map((item) => item.trim())
      .sort();
  if (value && typeof value === "object") return value;
  return String(value ?? "")
    .trim()
    .toLowerCase();
};

const answersMatch = (submitted, correct) =>
  JSON.stringify(normalizeAnswer(submitted)) ===
  JSON.stringify(normalizeAnswer(correct));

const updateGamification = async (studentId, isCorrect, xpEarned) => {
  const existing = await userGamification.findOne({ student: studentId });
  const now = new Date();
  const last = existing?.lastActivityDate
    ? new Date(existing.lastActivityDate)
    : null;
  const dayMs = 24 * 60 * 60 * 1000;
  const isSameDay = last?.toDateString() === now.toDateString();
  const isYesterday =
    last &&
    new Date(now.getTime() - dayMs).toDateString() === last.toDateString();

  const currentStreak = isSameDay
    ? (existing?.currentStreak ?? 0)
    : isYesterday
      ? (existing?.currentStreak ?? 0) + 1
      : 1;

  const nextHearts = isCorrect
    ? (existing?.hearts ?? 5)
    : Math.max(0, (existing?.hearts ?? 5) - 1);

  const totalXp = (existing?.totalXp ?? 0) + xpEarned;

  return userGamification.findOneAndUpdate(
    { student: studentId },
    {
      $set: {
        totalXp,
        level: Math.max(1, Math.floor(totalXp / 100) + 1),
        currentStreak,
        longestStreak: Math.max(existing?.longestStreak ?? 0, currentStreak),
        lastActivityDate: now,
        hearts: nextHearts,
      },
      $setOnInsert: { dailyGoalXp: 30 },
    },
    { upsert: true, new: true },
  );
};

const updateLessonProgress = async (studentId, lessonId, stepId, xpEarned) => {
  const lesson = await learningLesson.findById(lessonId);
  const module = lesson ? await learningModule.findById(lesson.module) : null;
  if (!lesson || !module) return null;

  const steps = await lessonStep.find({ lesson: lessonId }).select("_id");
  const tasks = await task
    .find({ step: { $in: steps.map((step) => step._id) } })
    .select("_id");
  const correctAttempts = await taskAttempt.distinct("task", {
    student: studentId,
    task: { $in: tasks.map((singleTask) => singleTask._id) },
    isCorrect: true,
  });

  const completed = tasks.length > 0 && correctAttempts.length >= tasks.length;

  return userProgress.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    {
      $set: {
        path: module.path,
        module: module._id,
        lesson: lessonId,
        step: stepId,
        status: completed ? "completed" : "in_progress",
        score: tasks.length
          ? Math.round((correctAttempts.length / tasks.length) * 100)
          : 0,
        lastAccessedAt: new Date(),
        ...(completed ? { completedAt: new Date() } : {}),
      },
      $inc: { xpEarned },
    },
    { upsert: true, new: true },
  );
};

export const createSubmission = async (req, res) => {
  try {
    const { taskId, assessment, submittedAnswer, answer } = req.body;
    const resolvedTaskId = taskId || assessment;
    const resolvedAnswer = submittedAnswer ?? answer;

    if (!resolvedTaskId || resolvedAnswer === undefined) {
      return res.status(400).json({
        message: "taskId and submittedAnswer are required",
      });
    }

    const foundTask = await task
      .findById(resolvedTaskId)
      .select("+correctAnswer")
      .populate("step");

    if (!foundTask) return res.status(404).json({ message: "Task not found" });

    const isCorrect = answersMatch(resolvedAnswer, foundTask.correctAnswer);
    const previousCorrect = await taskAttempt.exists({
      student: req.user.id,
      task: foundTask._id,
      isCorrect: true,
    });
    const xpEarned = isCorrect && !previousCorrect ? foundTask.xpReward : 0;

    const attempt = await taskAttempt.create({
      student: req.user.id,
      task: foundTask._id,
      lesson: (foundTask.step as unknown as PopulatedStepRef).lesson,
      submittedAnswer: resolvedAnswer,
      isCorrect,
      xpEarned,
    });

    const [gamification, progress] = await Promise.all([
      updateGamification(req.user.id, isCorrect, xpEarned),
      updateLessonProgress(
        req.user.id,
        (foundTask.step as unknown as PopulatedStepRef).lesson,
        (foundTask.step as unknown as PopulatedStepRef)._id,
        xpEarned,
      ),
    ]);

    return res.status(201).json({
      message: isCorrect ? "Correct answer" : "Incorrect answer",
      Submission: attempt,
      attempt,
      isCorrect,
      feedback: foundTask.explanation,
      xpEarned,
      heartsRemaining: gamification.hearts,
      progress,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getSubmissionByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const attempts = await taskAttempt
      .find({ lesson: lessonId })
      .populate("student", "firstName lastName email")
      .populate("task", "question type")
      .sort("-attemptedAt");

    return res.status(200).json({
      message: "Task attempts fetched successfully",
      Submission: attempts,
      attempts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching task attempts",
      error: error.message,
    });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const attempt = await taskAttempt
      .findById(req.params.id)
      .populate("student", "firstName lastName email")
      .populate("task", "question type");

    if (!attempt)
      return res.status(404).json({ message: "Task attempt not found" });

    return res.status(200).json({
      message: "Task attempt fetched successfully",
      Submission: attempt,
      attempt,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch task attempt",
      error: error.message,
    });
  }
};

export const updateSubmissionGrade = async (req, res) => {
  try {
    const { isCorrect, xpEarned } = req.body;
    const attempt = await taskAttempt.findByIdAndUpdate(
      req.params.id,
      { isCorrect, xpEarned },
      { new: true },
    );

    if (!attempt)
      return res.status(404).json({ message: "Task attempt not found" });

    return res.status(200).json({
      message: "Task attempt updated successfully",
      Submission: attempt,
      attempt,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const attempt = await taskAttempt.findByIdAndDelete(req.params.id);
    if (!attempt)
      return res.status(404).json({ message: "Task attempt not found" });

    return res.status(200).json({ message: "Task attempt deleted" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete task attempt",
      error: error.message,
    });
  }
};
