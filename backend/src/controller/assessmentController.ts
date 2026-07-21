import { task } from "../model/task.ts";
import { lessonStep } from "../model/lessonStep.ts";
import { learningLesson } from "../model/learningLesson.ts";
import { learningModule } from "../model/learningModule.ts";
import type { PopulatedPathRef, PopulatedStepRef } from "../types/types.ts";

const canEditLesson = async (req, lessonId) => {
  const lesson = await learningLesson.findById(lessonId);
  if (!lesson) return { status: 404, message: "Lesson not found" };

  const module = await learningModule
    .findById(lesson.module)
    .populate("path", "createdBy");
  if (
    !module ||
    (req.user?.role !== "Admin" &&
      (module.path as unknown as PopulatedPathRef).createdBy.toString() !==
        req.user?.id?.toString())
  ) {
    return { status: 403, message: "Unauthorized" };
  }

  return { lesson };
};

export const createAssessment = async (req, res) => {
  try {
    const {
      step,
      lesson,
      type,
      question,
      instructions = "",
      options = [],
      correctAnswer,
      explanation = "",
      xpReward = 10,
      maxAttempts = 3,
      sortOrder = 1,
    } = req.body;

    if (!step || !type || !question || correctAnswer === undefined) {
      return res.status(400).json({
        message: "step, type, question, and correctAnswer are required",
      });
    }

    const foundStep = await lessonStep.findById(step);
    if (!foundStep)
      return res.status(404).json({ message: "Lesson step not found" });

    const access = await canEditLesson(req, lesson || foundStep.lesson);
    if (access.status)
      return res.status(access.status).json({ message: access.message });

    const createdTask = await task.create({
      step,
      type,
      question,
      instructions,
      options,
      correctAnswer,
      explanation,
      xpReward,
      maxAttempts,
      sortOrder,
    });

    return res.status(201).json({
      message: "Task created successfully",
      assessment: createdTask,
      task: createdTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};

export const getAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const foundTask = await task.findById(id).populate("step");

    if (!foundTask) return res.status(404).json({ message: "Task not found" });

    return res.status(200).json({
      message: "Task retrieved successfully",
      assessment: foundTask,
      task: foundTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch task",
      error: error.message,
    });
  }
};

export const updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = [
      "type",
      "question",
      "instructions",
      "options",
      "correctAnswer",
      "explanation",
      "xpReward",
      "maxAttempts",
      "sortOrder",
    ];
    const update = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key)),
    );

    const existingTask = await task.findById(id).populate("step");
    if (!existingTask)
      return res.status(404).json({ message: "Task not found" });

    const access = await canEditLesson(
      req,
      (existingTask.step as unknown as PopulatedStepRef).lesson,
    );
    if (access.status)
      return res.status(access.status).json({ message: access.message });

    const updatedTask = await task.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Task updated successfully",
      assessment: updatedTask,
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
};

export const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const existingTask = await task.findById(id).populate("step");
    if (!existingTask)
      return res.status(404).json({ message: "Task not found" });

    const access = await canEditLesson(
      req,
      (existingTask.step as unknown as PopulatedStepRef).lesson,
    );
    if (access.status)
      return res.status(access.status).json({ message: access.message });

    await existingTask.deleteOne();

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting task",
      error: error.message,
    });
  }
};

export const getAssessmentByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const steps = await lessonStep
      .find({ lesson: lessonId })
      .sort({ order: 1 });
    const tasks = await task
      .find({ step: { $in: steps.map((step) => step._id) } })
      .populate("step")
      .sort({ sortOrder: 1 });

    return res.status(200).json({
      message: "Tasks retrieved successfully",
      assessments: tasks,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};
