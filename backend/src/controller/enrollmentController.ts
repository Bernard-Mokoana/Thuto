import mongoose from "mongoose";
import { pathEnrollment } from "../model/pathEnrollment.ts";
import { learningPath } from "../model/learningPath.ts";
import { learningModule } from "../model/learningModule.ts";
import { learningLesson } from "../model/learningLesson.ts";
import { userProgress } from "../model/userProgress.ts";
import { userGamification } from "../model/userGamification.ts";

export const enrollInCourse = async (req, res) => {
  const { userId, pathId, courseId, path, course, student } = req.body;
  const resolvedUserId = req.user?.id || userId || student;
  const resolvedPathId = pathId || courseId || path || course;

  try {
    if (!resolvedUserId || !resolvedPathId) {
      return res.status(400).json({ message: "userId and pathId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(resolvedUserId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    if (!mongoose.Types.ObjectId.isValid(resolvedPathId)) {
      return res.status(400).json({ message: "Invalid pathId format" });
    }

    const existingPath = await learningPath
      .findById(resolvedPathId)
      .select("_id isPublished");

    if (!existingPath) return res.status(404).json({ message: "Learning path not found" });
    if (!existingPath.isPublished) {
      return res.status(403).json({ message: "Learning path is not published yet" });
    }

    const existingEnrollment = await pathEnrollment.findOne({
      student: resolvedUserId,
      path: resolvedPathId,
    });

    if (existingEnrollment) {
      return res.status(409).json({ message: "Already enrolled in this path" });
    }

    const modules = await learningModule
      .find({ path: resolvedPathId, isPublished: true })
      .sort({ order: 1 })
      .select("_id");
    const firstLesson = await learningLesson
      .findOne({ module: { $in: modules.map((module) => module._id) }, isPublished: true })
      .sort({ order: 1 })
      .select("_id");

    const enrollment = await pathEnrollment.create({
      student: resolvedUserId,
      path: resolvedPathId,
      currentLesson: firstLesson?._id,
    });

    await userGamification.findOneAndUpdate(
      { student: resolvedUserId },
      { $setOnInsert: { totalXp: 0, level: 1, hearts: 5, dailyGoalXp: 30 } },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      message: "Student enrolled successfully",
      Enrollment: enrollment,
      enrollment,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Already enrolled in this path" });
    }

    return res.status(500).json({
      message: "Error enrolling a student",
      error: error.message,
    });
  }
};

export const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const enrollments = await pathEnrollment
      .find({ student: targetUserId })
      .populate("path")
      .populate("currentLesson")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      message: "Student enrollments successfully fetched",
      enrollments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching student enrollments",
      error: error.message,
    });
  }
};

export const markLessonComplete = async (req, res) => {
  const { enrollmentId, lessonId } = req.body;

  try {
    const enrollment = await pathEnrollment.findById(enrollmentId);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    const lesson = await learningLesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const module = await learningModule.findById(lesson.module);
    if (!module) return res.status(404).json({ message: "Module not found" });

    const progress = await userProgress.findOneAndUpdate(
      { student: enrollment.student, lesson: lessonId },
      {
        $set: {
          path: enrollment.path,
          module: module._id,
          lesson: lessonId,
          status: "completed",
          score: 100,
          lastAccessedAt: new Date(),
          completedAt: new Date(),
        },
        $inc: { xpEarned: lesson.xpReward },
      },
      { upsert: true, new: true }
    );

    const nextLesson = await learningLesson
      .findOne({
        module: lesson.module,
        order: { $gt: lesson.order },
        isPublished: true,
      })
      .sort({ order: 1 })
      .select("_id");

    enrollment.currentLesson = nextLesson?._id ?? lesson._id;
    await enrollment.save();

    return res.status(200).json({
      message: "Lesson marked as completed",
      Enrollment: enrollment,
      enrollment,
      progress,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error marking lesson complete",
      error: error.message,
    });
  }
};

export const deleteEnrollment = async (req, res) => {
  try {
    const deleted = await pathEnrollment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Enrollment not found" });

    return res.status(200).json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting an enrollment",
      error: error.message,
    });
  }
};
