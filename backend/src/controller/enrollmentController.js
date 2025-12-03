import { enrollment } from "../model/enrollment.js";
import { lessons } from "../model/lessons.js";
import mongoose from "mongoose";

export const enrollInCourse = async (req, res) => {
  const { userId, courseId, progress } = req.body;

  try {
    const Lesson = await lessons.find({ course: courseId });
    Lesson.map((lesson) => ({
      lesson: lesson._id,
      completed: false,
    }));

    const Enrollment = await enrollment.create({
      student: userId,
      course: courseId,
      progress,
    });

    return res
      .status(201)
      .json({ message: "Student enrolled successfully", Enrollment });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error enrolling a student", error: error.message });
  }
};

export const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user._id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId))
      return res.status(400).json({ message: "Invalid userId format" });

    const enrollments = await enrollment
      .find({ student: targetUserId })
      .populate("course")
      .populate("progress.lesson");

    return res.status(200).json({
      message: "Student enrollments successfully fetched",
      enrollments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching a student enrollments",
      error: error.message,
    });
  }
};

export const markLessonComplete = async (req, res) => {
  const { enrollmentId, lessonId } = req.body;

  try {
    const Enrollment = await enrollment.findById(enrollmentId);
    if (!Enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    const lessonProgress = Enrollment.progress.find(
      (p) => p.lesson.toString() === lessonId
    );
    if (!lessonProgress)
      return res.status(404).json({ message: "Lesson not found in progress" });

    lessonProgress.completed = true;
    lessonProgress.completedAt = new Date();

    await Enrollment.save();
    return res
      .status(201)
      .json({ message: "Lesson marked as completed", Enrollment });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error marking lesson complete", error: error.message });
  }
};

export const deleteEnrollment = async (req, res) => {
  try {
    await enrollment.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting an enrollment", error: error.message });
  }
};
