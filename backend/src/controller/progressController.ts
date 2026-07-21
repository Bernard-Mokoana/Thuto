import { learningModule } from "../model/learningModule.ts";
import { learningLesson } from "../model/learningLesson.ts";
import { userProgress } from "../model/userProgress.ts";

export const checkCourseCompletion = async (req, res) => {
  const { userId, courseId, pathId } = req.params;
  const resolvedPathId = pathId || courseId;

  try {
    const modules = await learningModule.find({ path: resolvedPathId }).select("_id");
    const lessons = await learningLesson
      .find({ module: { $in: modules.map((module) => module._id) }, isPublished: true })
      .select("_id");

    if (lessons.length === 0) {
      return res.status(404).json({ message: "No lessons found for this path" });
    }

    const completedProgress = await userProgress.find({
      student: userId,
      lesson: { $in: lessons.map((lesson) => lesson._id) },
      status: "completed",
    });

    const isCompleted = completedProgress.length >= lessons.length;

    return res.status(200).json({
      pathId: resolvedPathId,
      courseId: resolvedPathId,
      userId,
      isCompleted,
      completedLessons: completedProgress.length,
      totalLessons: lessons.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
