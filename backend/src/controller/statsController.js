import { enrollment } from "../model/enrollment.js";
import { course } from "../model/course.js";
import { Transaction } from "../model/transaction.js";
import dayjs from "dayjs";
export const getPopularCourses = async (req, res) => {
  try {
    const results = await enrollment.aggregate([
      {
        $group: {
          _id: "$course",
          totalEnrolled: { $sum: 1 },
        },
      },
      { $sort: { totalEnrolled: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "course",
          localField: "_id",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      { $unwind: "$courseDetails" },
      {
        $project: {
          _id: 0,
          courseId: "$courseDetails._id",
          title: "$courseDetails.title",
          category: "$courseDetails.category",
          totalEnrolled: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json({ message: "courses fetched successfully", results });
  } catch (error) {
    return res.status.json({ message: "Error fetching popular courses" });
  }
};

export const getTutorEarnings = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const result = await Transaction.aggregate([
      { $match: { status: "success" } },
      {
        $lookup: {
          from: "courses",
          localFiled: "course",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      { $unwind: "$courseDetails" },
      { $match: { "courseDetails.tutor": tutorId } },
      {
        $group: {
          _id: "$course",
          totalEarnings: { $sum: "$amount" },
          title: { $first: "$courseDetails.title" },
        },
      },
      { $sort: { totalEarnings: -1 } },
    ]);

    return res
      .status(200)
      .json({ message: "Total earnings fetched successfully", result });
  } catch (error) {
    return res.status.json({ message: "Error fetching earnings" });
  }
};

export const getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user._id;

    const result = await enrollment.aggregate([
      { $match: { student: studentId } },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      { $unwind: "$courseDetails" },
      {
        $project: {
          _id: 0,
          courseId: "$courseDetails._id",
          title: "$courseDetails.title",
          progress: 1,
          isComplete: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json({ message: "Student progress fetched", result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching student progress summary" });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const result = await Transaction.aggregate([
      { $match: { status: "success" } },
      {
        $project: {
          amount: 1,
          month: { $month: "$date" },
          year: { $year: "$date" },
        },
      },
      { $match: { year: currentYear } },
      {
        $group: {
          _id: "$month",
          totalRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const entry = result.find((r) => r._id === i + 1);
      return {
        month: dayjs().month(i).format("MMMM"),
        totalRevenue: entry?.totalRevenue || 0,
      };
    });

    return res.status(200).json({
      message: "Monthly revenue generated successfully",
      monthlyRevenue,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error generating monthly revenue" });
  }
};

export const getCourseCategoryStats = async (req, res) => {
  try {
    const result = await course.aggregate([
      {
        $lookup: {
          from: "enrollments",
          localFiled: "_id",
          foreignField: "course",
          as: "enrollments",
        },
      },
      {
        $group: {
          _id: "$category",
          numCourses: { $sum: 1 },
          totalEnrolled: { $sum: { $size: "$enrollments" } },
        },
      },
      { $sort: { totalEnrolled: -1 } },
    ]);

    return res
      .status(200)
      .json({ message: "Course category stats fetched successfully", result });
  } catch (error) {
    return (
      res, status(500).json({ message: "Error fetching the course category" })
    );
  }
};

export const getTopTutorsThisMonth = async (req, res) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const results = await Transaction.aggregate([
      {
        $match: {
          status: "success",
          date: { $gte: firstDay, $lte: lastDay },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      { $unwind: "$courseDetails" },
      {
        $group: {
          _id: "$courseDetails.tutor",
          totalEarnings: { $sum: "$amount" },
        },
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 5 },
    ]);

    return res
      .status(200)
      .json({ message: "Top tutors fetched successfully", results });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching top tutors" });
  }
};
