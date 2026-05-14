import { submission } from "../model/submission.js";

export const averageGradePerCourse = async (req, res) => {
  try {
    const results = await submission.aggregate([
      {
        $group: {
          _id: "$course",
          averageGrade: { $avg: "$grade" },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      {
        $unwind: "$courseInfo",
      },
      {
        $project: {
          _id: 0,
          courseId: "$courseInfo._id",
          courseTitle: "$courseInfo.title",
          averageGrade: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json({ message: "Average grade calculated successfully", results });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const submissionsPerLesson = async (req, res) => {
  try {
    const results = await submission.aggregate([
      {
        $group: {
          _id: "$lesson",
          submissionCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "lessons",
          localField: "_id",
          foreignField: "_id",
          as: "lessonInfo",
        },
      },
      {
        $unwind: "$lessonInfo",
      },
      {
        $project: {
          _id: 0,
          lessonId: "$lessonInfo._id",
          lessonTittle: "$lessonInfo.title",
          submissionCount: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json({ message: "Submission per lesson fetched successfully", results });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const topPerformingStudents = async (req, res) => {
  try {
    const results = await submission.aggregate([
      {
        $group: {
          _id: "$user",
          avgGrade: { $avg: "$grade" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          _id: 0,
          userId: "$userInfo._id",
          name: "$username.name",
          email: "$userInfo.email",
          avgGrade: 1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    return res.status(200).json({
      message: "Top performing students are fetched successfully",
      results,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
