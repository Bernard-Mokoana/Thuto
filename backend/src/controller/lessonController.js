import mongoose from "mongoose";
import { lessons } from "../model/lessons.js";
import { course } from "../model/course.js";
import { getVideoDurationInSeconds } from "../utils/videoDuration.utils.js";

/** Recompute and persist course total duration from the sum of its lessons. */
export const refreshCourseDuration = async (courseId) => {
  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) return;
  const id =
    typeof courseId === "string"
      ? new mongoose.Types.ObjectId(courseId)
      : courseId;
  const [result] = await lessons.aggregate([
    { $match: { course: id } },
    { $group: { _id: null, total: { $sum: "$duration" } } },
  ]);
  const totalSeconds = result?.total ?? 0;
  await course.findByIdAndUpdate(id, { duration: totalSeconds });
};

export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, videoUrl, order, duration } = req.body;

    if (!title || order === undefined)
      return res.status(400).json({ message: "Title and order are required" });

    const existingCourse = await course.findById(courseId);

    if (!existingCourse)
      return res.status(404).json({ message: "Course not found" });

    if (!existingCourse.tutor) {
      return res.status(400).json({ message: "Course has no tutor assigned" });
    }
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (existingCourse.tutor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "You do not own this course" });
    }

    const uploadedVideo = req.files?.video?.[0]?.location;
    const uploadedMaterials =
      req.files?.materials?.map((file) => file.location) || [];
    const resolvedVideoUrl = uploadedVideo || videoUrl;

    let resolvedDuration = Number(duration);
    const shouldProbeDuration =
      (!Number.isFinite(resolvedDuration) || resolvedDuration <= 0) &&
      !!resolvedVideoUrl;

    if (shouldProbeDuration) {
      try {
        resolvedDuration = await getVideoDurationInSeconds(resolvedVideoUrl);
      } catch (probeError) {
        console.warn("Failed to probe lesson video duration:", probeError);
        resolvedDuration = 0;
      }
    }

    if (!Number.isFinite(resolvedDuration) || resolvedDuration < 0) {
      resolvedDuration = 0;
    }

    const newLesson = await lessons.create({
      course: courseId,
      title,
      content,
      videoUrl: resolvedVideoUrl,
      materials: uploadedMaterials,
      order,
      duration: resolvedDuration,
    });

    await refreshCourseDuration(courseId);

    return res
      .status(200)
      .json({ message: "Lesson created successfully", newLesson });
  } catch (error) {
    console.error("Error in creating a lesson", error);

    return res
      .status(500)
      .json({ message: "Error creating a lesson", error: error.message });
  }
};

export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const Lessons = await lessons.find({ course: courseId }).sort("order");
    return res
      .status(200)
      .json({ message: "Lessons fetched successfully", Lessons });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching the lessons" });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await lessons.findById(id);

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    return res
      .status(200)
      .json({ message: "Lesson fetched successfully", lesson });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching the lessons" });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, videoUrl, order, duration } = req.body;

    const lesson = await lessons.findById(id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const Course = await course.findById(lesson.course);
    if (!Course)
      return res.status(404).json({ message: "Course not found" });
    if (!Course.tutor)
      return res.status(400).json({ message: "Course has no tutor assigned" });
    if (Course.tutor.toString() !== req.user?.id?.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const uploadedVideo = req.files?.video?.[0]?.location;
    const uploadedMaterialUrls =
      req.files?.materials?.map((file) => file.location) || [];
    const nextVideoUrl =
      uploadedVideo ?? (videoUrl !== undefined ? videoUrl : lesson.videoUrl);
    const nextMaterials =
      uploadedMaterialUrls.length > 0
        ? [...(lesson.materials ?? []), ...uploadedMaterialUrls]
        : lesson.materials ?? [];
    let nextDuration =
      duration !== undefined ? Number(duration) : Number(lesson.duration);

    const videoUrlChanged =
      nextVideoUrl != null &&
      String(nextVideoUrl) !== String(lesson.videoUrl ?? "");
    const durationInvalid =
      !Number.isFinite(nextDuration) || nextDuration <= 0;
    const shouldProbeDuration =
      (durationInvalid || videoUrlChanged) && Boolean(nextVideoUrl);

    if (shouldProbeDuration) {
      try {
        nextDuration = await getVideoDurationInSeconds(nextVideoUrl);
      } catch (probeError) {
        console.warn("Failed to probe lesson video duration:", probeError);
        nextDuration = 0;
      }
    }

    if (!Number.isFinite(nextDuration) || nextDuration < 0) {
      nextDuration = 0;
    }

    lesson.title = title ?? lesson.title;
    lesson.content = content ?? lesson.content;
    lesson.videoUrl = nextVideoUrl ?? lesson.videoUrl;
    lesson.materials = nextMaterials;
    lesson.order = order ?? lesson.order;
    lesson.duration = nextDuration;

    const updated = await lesson.save();

    await refreshCourseDuration(lesson.course);

    return res
      .status(200)
      .json({ message: "Lessons updated successfully", updated });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating a lesson", error: error.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await lessons.findById(id);
    if (!lesson) return res.status(404).json({ message: "lesson not found" });

    const Course = await course.findById(lesson.course);
    if (!Course)
      return res.status(404).json({ message: "Course not found" });
    if (!Course.tutor || Course.tutor.toString() !== req.user?.id?.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const courseId = lesson.course;
    await lesson.deleteOne();
    await refreshCourseDuration(courseId);

    return res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting a lesson", error: error.message });
  }
};
