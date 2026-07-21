import { taskAttempt } from "../model/taskAttempt.ts";
import { userProgress } from "../model/userProgress.ts";
import { userGamification } from "../model/userGamification.ts";

export const averageGradePerCourse = async (req, res) => {
  try {
    const results = await userProgress.aggregate([
      {
        $group: {
          _id: "$path",
          averageScore: { $avg: "$score" },
          completedLessons: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "learningpaths",
          localField: "_id",
          foreignField: "_id",
          as: "pathInfo",
        },
      },
      { $unwind: "$pathInfo" },
      {
        $project: {
          _id: 0,
          pathId: "$pathInfo._id",
          courseId: "$pathInfo._id",
          pathTitle: "$pathInfo.title",
          courseTitle: "$pathInfo.title",
          averageScore: 1,
          completedLessons: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Average score calculated successfully",
      results,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const submissionsPerLesson = async (req, res) => {
  try {
    const results = await taskAttempt.aggregate([
      { $group: { _id: "$lesson", attemptCount: { $sum: 1 } } },
      {
        $lookup: {
          from: "learninglessons",
          localField: "_id",
          foreignField: "_id",
          as: "lessonInfo",
        },
      },
      { $unwind: "$lessonInfo" },
      {
        $project: {
          _id: 0,
          lessonId: "$lessonInfo._id",
          lessonTitle: "$lessonInfo.title",
          submissionCount: "$attemptCount",
          attemptCount: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Task attempts per lesson fetched successfully",
      results,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const topPerformingStudents = async (req, res) => {
  try {
    const results = await userGamification
      .find({})
      .populate("student", "firstName lastName email")
      .sort({ totalXp: -1, currentStreak: -1 })
      .limit(10);

    return res.status(200).json({
      message: "Top performing students fetched successfully",
      results,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
