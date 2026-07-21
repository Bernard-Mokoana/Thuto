import mongoose from "mongoose";
import type { PopulatedPathRef } from "../types/types.ts";
import { learningPath } from "../model/learningPath.ts";
import { learningModule } from "../model/learningModule.ts";
import { learningLesson } from "../model/learningLesson.ts";
import { lessonStep } from "../model/lessonStep.ts";
import { task } from "../model/task.ts";

const canEditPath = (req, path) =>
  req.user?.role === "Admin" ||
  (path as PopulatedPathRef).createdBy.toString() === req.user?.id?.toString();

const ensurePathAccess = async (req, pathId) => {
  if (!mongoose.Types.ObjectId.isValid(pathId)) {
    return { status: 400, message: "Invalid path ID format" };
  }

  const path = await learningPath.findById(pathId).select("_id createdBy");
  if (!path) return { status: 404, message: "Learning path not found" };
  if (!canEditPath(req, path)) return { status: 403, message: "Unauthorized" };

  return { path };
};

export const createModule = async (req, res) => {
  try {
    const { pathId } = req.params;
    const {
      title,
      description = "",
      order,
      requiredXpToUnlock = 0,
      isPublished = false,
    } = req.body;

    if (!title || order === undefined) {
      return res.status(400).json({ message: "Title and order are required" });
    }

    const access = await ensurePathAccess(req, pathId);
    if (access.status)
      return res.status(access.status).json({ message: access.message });

    const createdModule = await learningModule.create({
      path: pathId,
      title,
      description,
      order,
      requiredXpToUnlock,
      isPublished,
    });

    return res.status(201).json({
      message: "Module created successfully",
      module: createdModule,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating module",
      error: error.message,
    });
  }
};

export const getModulesByPath = async (req, res) => {
  try {
    const { pathId } = req.params;
    const modules = await learningModule
      .find({ path: pathId })
      .sort({ order: 1 });

    return res.status(200).json({
      message: "Modules fetched successfully",
      modules,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching modules",
      error: error.message,
    });
  }
};

export const createLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const {
      title,
      summary = "",
      order,
      xpReward = 10,
      estimatedMinutes = 3,
      isPublished = false,
    } = req.body;

    if (!title || order === undefined) {
      return res.status(400).json({ message: "Title and order are required" });
    }

    const module = await learningModule
      .findById(moduleId)
      .populate("path", "createdBy");
    if (!module) return res.status(404).json({ message: "Module not found" });
    if (!canEditPath(req, module.path)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const createdLesson = await learningLesson.create({
      module: moduleId,
      title,
      summary,
      order,
      xpReward,
      estimatedMinutes,
      isPublished,
    });

    return res.status(201).json({
      message: "Lesson created successfully",
      newLesson: createdLesson,
      lesson: createdLesson,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating lesson",
      error: error.message,
    });
  }
};

export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId, pathId, moduleId } = req.params;

    if (moduleId) {
      const lessons = await learningLesson
        .find({ module: moduleId })
        .sort({ order: 1 });
      return res.status(200).json({
        message: "Lessons fetched successfully",
        Lessons: lessons,
        lessons,
      });
    }

    const resolvedPathId = pathId || courseId;
    const modules = await learningModule
      .find({ path: resolvedPathId })
      .select("_id");
    const lessons = await learningLesson
      .find({ module: { $in: modules.map((module) => module._id) } })
      .sort({ order: 1 });

    return res.status(200).json({
      message: "Lessons fetched successfully",
      Lessons: lessons,
      lessons,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching lessons",
      error: error.message,
    });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await learningLesson.findById(id).populate("module");

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const steps = await lessonStep
      .find({ lesson: id })
      .sort({ order: 1 })
      .lean();
    const stepIds = steps.map((step) => step._id);
    const tasks = await task
      .find({ step: { $in: stepIds } })
      .sort({ sortOrder: 1 })
      .lean();

    return res.status(200).json({
      message: "Lesson fetched successfully",
      lesson,
      steps: steps.map((step) => ({
        ...step,
        tasks: tasks.filter(
          (singleTask) => singleTask.step.toString() === step._id.toString(),
        ),
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching lesson",
      error: error.message,
    });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, order, xpReward, estimatedMinutes, isPublished } =
      req.body;

    const lesson = await learningLesson.findById(id).populate({
      path: "module",
      populate: { path: "path", select: "createdBy" },
    });

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const module = await learningModule
      .findById(lesson.module)
      .populate("path", "createdBy");
    if (!module || !canEditPath(req, module.path)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (title !== undefined) lesson.title = title;
    if (summary !== undefined) lesson.summary = summary;
    if (order !== undefined) lesson.order = order;
    if (xpReward !== undefined) lesson.xpReward = xpReward;
    if (estimatedMinutes !== undefined)
      lesson.estimatedMinutes = estimatedMinutes;
    if (isPublished !== undefined) lesson.isPublished = isPublished;

    const updated = await lesson.save();

    return res.status(200).json({
      message: "Lesson updated successfully",
      updated,
      lesson: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating lesson",
      error: error.message,
    });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await learningLesson.findById(id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const module = await learningModule
      .findById(lesson.module)
      .populate("path", "createdBy");
    if (!module || !canEditPath(req, module.path)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const steps = await lessonStep.find({ lesson: id }).select("_id");
    await task.deleteMany({ step: { $in: steps.map((step) => step._id) } });
    await lessonStep.deleteMany({ lesson: id });
    await lesson.deleteOne();

    return res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting lesson",
      error: error.message,
    });
  }
};

export const createLessonStep = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const {
      type,
      title = "",
      prompt = "",
      content = "",
      order,
      isCheckpoint = false,
    } = req.body;

    if (!type || order === undefined) {
      return res.status(400).json({ message: "Type and order are required" });
    }

    const lesson = await learningLesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const module = await learningModule
      .findById(lesson.module)
      .populate("path", "createdBy");
    if (!module || !canEditPath(req, module.path)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const createdStep = await lessonStep.create({
      lesson: lessonId,
      type,
      title,
      prompt,
      content,
      order,
      isCheckpoint,
    });

    return res.status(201).json({
      message: "Lesson step created successfully",
      step: createdStep,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating lesson step",
      error: error.message,
    });
  }
};

export const getStepsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const steps = await lessonStep
      .find({ lesson: lessonId })
      .sort({ order: 1 })
      .lean();
    const tasks = await task
      .find({ step: { $in: steps.map((step) => step._id) } })
      .sort({ sortOrder: 1 })
      .lean();

    return res.status(200).json({
      message: "Lesson steps fetched successfully",
      steps: steps.map((step) => ({
        ...step,
        tasks: tasks.filter(
          (singleTask) => singleTask.step.toString() === step._id.toString(),
        ),
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching lesson steps",
      error: error.message,
    });
  }
};
