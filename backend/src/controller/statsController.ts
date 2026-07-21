import { pathEnrollment } from "../model/pathEnrollment.ts";
import { learningPath } from "../model/learningPath.ts";
import { userProgress } from "../model/userProgress.ts";
import { taskAttempt } from "../model/taskAttempt.ts";
import { userGamification } from "../model/userGamification.ts";

export const getPopularCourses = async (req, res) => {
  try {
    const results = await pathEnrollment.aggregate([
      { $group: { _id: "$path", totalEnrolled: { $sum: 1 } } },
      { $sort: { totalEnrolled: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "learningpaths",
          localField: "_id",
          foreignField: "_id",
          as: "pathDetails",
        },
      },
      { $unwind: "$pathDetails" },
      {
        $project: {
          _id: 0,
          pathId: "$pathDetails._id",
          courseId: "$pathDetails._id",
          title: "$pathDetails.title",
          category: "$pathDetails.category",
          totalEnrolled: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Popular learning paths fetched successfully",
      results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching popular learning paths",
      error: error.message,
    });
  }
};

export const getTutorEarnings = async (req, res) => {
  return res.status(410).json({
    message: "Tutor earnings were removed for the gamified learning model",
  });
};

export const getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await userProgress
      .find({ student: studentId })
      .populate("path", "title")
      .populate("module", "title")
      .populate("lesson", "title")
      .sort({ lastAccessedAt: -1 });

    return res.status(200).json({
      message: "Student progress fetched",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching student progress summary",
      error: error.message,
    });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  return res.status(410).json({
    message: "Revenue stats were removed for the gamified learning model",
  });
};

export const getCourseCategoryStats = async (req, res) => {
  try {
    const result = await learningPath.aggregate([
      {
        $lookup: {
          from: "pathenrollments",
          localField: "_id",
          foreignField: "path",
          as: "enrollments",
        },
      },
      {
        $group: {
          _id: "$category",
          numPaths: { $sum: 1 },
          totalEnrolled: { $sum: { $size: "$enrollments" } },
        },
      },
      { $sort: { totalEnrolled: -1 } },
    ]);

    return res.status(200).json({
      message: "Learning path category stats fetched successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching learning path category stats",
      error: error.message,
    });
  }
};

export const getTopTutorsThisMonth = async (req, res) => {
  try {
    const results = await userGamification
      .find({})
      .populate("student", "firstName lastName email")
      .sort({ totalXp: -1 })
      .limit(10);

    return res.status(200).json({
      message: "Top learners fetched successfully",
      results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching top learners",
      error: error.message,
    });
  }
};

export const getTaskAccuracy = async (req, res) => {
  try {
    const results = await taskAttempt.aggregate([
      {
        $group: {
          _id: "$task",
          attempts: { $sum: 1 },
          correct: { $sum: { $cond: ["$isCorrect", 1, 0] } },
        },
      },
      {
        $project: {
          task: "$_id",
          attempts: 1,
          correct: 1,
          accuracy: {
            $cond: [{ $eq: ["$attempts", 0] }, 0, { $divide: ["$correct", "$attempts"] }],
          },
        },
      },
      { $sort: { accuracy: 1 } },
    ]);

    return res.status(200).json({
      message: "Task accuracy fetched successfully",
      results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching task accuracy",
      error: error.message,
    });
  }
};
