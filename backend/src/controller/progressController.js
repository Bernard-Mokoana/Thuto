import { course } from "../model/course.js";
import { lessons } from "../model/lessons.js";
import { submission } from "../model/submission.js";

export const checkCourseCompletion = async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    const existingLessons = await lessons.find({ course: courseId });

    if (!existingLessons)
      return res
        .status(404)
        .json({ message: "No lessons found for this course" });

    const submissions = await submission.find({
      user: userId,
      lesson: { $in: existingLessons.map((l) => l._id) },
    });

    const lessonCompletion = existingLessons.map((lesson) => {
      const userSubmission = submissions.find(
        (sub) => sub.lesson.toString() === lesson._id.toString()
      );
      return userSubmission && userSubmission.grade >= 50;
    });

    const isCompleted = lessonCompletion.every((passed) => passed === true);

    return res.status(200).json({
      courseId,
      userId,
      isCompleted,
      completedLessons: lessonCompletion.filter(Boolean).length,
      totalLessons: existingLessons.length,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
