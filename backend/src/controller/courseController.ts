import mongoose from "mongoose";
import type { QueryObject } from "../types/types.ts";
import { learningPath } from "../model/learningPath.ts";
import { learningModule } from "../model/learningModule.ts";
import { learningLesson } from "../model/learningLesson.ts";
import { category as categoryModel } from "../model/category.ts";
import { pathEnrollment } from "../model/pathEnrollment.ts";

const resolveValidCategoryId = async (categoryId: String) => {
  const normalizedCategoryId =
    typeof categoryId === "string"
      ? categoryId.trim()
      : String(categoryId ?? "");

  if (
    !normalizedCategoryId ||
    !mongoose.Types.ObjectId.isValid(normalizedCategoryId)
  ) {
    return null;
  }

  const existingCategory = await categoryModel
    .findOne({ _id: normalizedCategoryId, isActive: true })
    .select("_id");

  return existingCategory?._id ?? null;
};

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getPathStats = async (pathIds) => {
  if (pathIds.length === 0) return new Map();

  const [modules, enrollments] = await Promise.all([
    learningModule.aggregate([
      { $match: { path: { $in: pathIds } } },
      {
        $lookup: {
          from: "learninglessons",
          localField: "_id",
          foreignField: "module",
          as: "lessons",
        },
      },
      {
        $group: {
          _id: "$path",
          moduleCount: { $sum: 1 },
          lessonCount: { $sum: { $size: "$lessons" } },
        },
      },
    ]),
    pathEnrollment.aggregate([
      { $match: { path: { $in: pathIds } } },
      { $group: { _id: "$path", enrollmentCount: { $sum: 1 } } },
    ]),
  ]);

  const stats = new Map();
  for (const item of modules) {
    stats.set(item._id.toString(), {
      moduleCount: item.moduleCount,
      lessonCount: item.lessonCount,
      enrollmentCount: 0,
    });
  }
  for (const item of enrollments) {
    const id = item._id.toString();
    stats.set(id, {
      moduleCount: stats.get(id)?.moduleCount ?? 0,
      lessonCount: stats.get(id)?.lessonCount ?? 0,
      enrollmentCount: item.enrollmentCount,
    });
  }

  return stats;
};

const attachStats = async (paths) => {
  const pathIds = paths.map((path) => path._id);
  const stats = await getPathStats(pathIds);

  return paths.map((path) => {
    const id = path._id.toString();
    return {
      ...path,
      moduleCount: stats.get(id)?.moduleCount ?? 0,
      lessonCount: stats.get(id)?.lessonCount ?? 0,
      enrollmentCount: stats.get(id)?.enrollmentCount ?? 0,
    };
  });
};

const createCourse = async (req, res) => {
  const {
    title,
    category,
    description,
    level = "beginner",
    estimatedMinutes = 0,
    tags = [],
    outcomes = [],
  } = req.body;

  const missingFields: string[] = [];
  if (!title?.trim()) missingFields.push("title");
  if (!category) missingFields.push("category");
  if (!description?.trim()) missingFields.push("description");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required field(s): ${missingFields.join(", ")}`,
    });
  }

  try {
    const validCategoryId = await resolveValidCategoryId(category);
    if (!validCategoryId) {
      return res.status(400).json({ message: "Invalid or inactive category" });
    }

    const baseSlug = slugify(title);
    const existingPath = await learningPath.findOne({ slug: baseSlug });
    if (existingPath) {
      return res
        .status(409)
        .json({ message: "Learning path already exists", path: existingPath });
    }

    const createdPath = await learningPath.create({
      title,
      slug: baseSlug,
      category: validCategoryId,
      description,
      level,
      estimatedMinutes,
      tags: Array.isArray(tags) ? tags : String(tags).split(","),
      outcomes: Array.isArray(outcomes)
        ? outcomes
        : String(outcomes).split(","),
      thumbnail: req.file?.location ?? req.body.thumbnail ?? "",
      createdBy: req.user.id,
    });

    return res.status(201).json({
      message: "Learning path created successfully",
      course: createdPath,
      path: createdPath,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create learning path",
      error: error.message,
    });
  }
};

const getCourse = async (req, res) => {
  const { search, level, category, sortBy } = req.query;

  try {
    const query: QueryObject = { isPublished: true };

    if (search?.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { tags: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (level) query.level = level;

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: "Invalid category format" });
      }
      query.category = category;
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      xp: { totalXp: -1 },
      duration: { estimatedMinutes: 1 },
    };

    const paths = await learningPath
      .find(query)
      .populate("createdBy", "firstName lastName")
      .populate("category", "name")
      .sort(sortMap[sortBy] || sortMap.newest)
      .lean();

    return res.status(200).json({
      message: "Learning paths fetched successfully",
      course: await attachStats(paths),
      paths,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch learning paths",
      error: error.message,
    });
  }
};

const getTutorCourses = async (req, res) => {
  try {
    const paths = await learningPath
      .find({ createdBy: req.user.id })
      .populate("createdBy", "firstName lastName")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    const withStats = await attachStats(paths);

    return res.status(200).json({
      message: "Creator learning paths fetched successfully",
      course: withStats,
      paths: withStats,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch creator learning paths",
      error: error.message,
    });
  }
};

const getTutorCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid path ID format" });
    }

    const query =
      req.user?.role === "Admin"
        ? { _id: id }
        : { _id: id, createdBy: req.user.id };

    const foundPath = await learningPath
      .findOne(query)
      .populate("createdBy", "firstName lastName email")
      .populate("category", "name");

    if (!foundPath) {
      return res.status(404).json({ message: "Learning path not found" });
    }

    return res.status(200).json({
      message: "Learning path found successfully",
      course: foundPath,
      path: foundPath,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch learning path",
      error: error.message,
    });
  }
};

const getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid path ID format" });
    }

    const foundPath = await learningPath
      .findById(id)
      .populate("createdBy", "firstName lastName")
      .populate("category", "name");

    if (!foundPath) {
      return res.status(404).json({ message: "Learning path not found" });
    }

    const modules = await learningModule
      .find({ path: id, isPublished: true })
      .sort({ order: 1 })
      .lean();

    const lessons = await learningLesson
      .find({
        module: { $in: modules.map((module) => module._id) },
        isPublished: true,
      })
      .sort({ order: 1 })
      .lean();

    return res.status(200).json({
      message: "Learning path found successfully",
      course: foundPath,
      path: foundPath,
      modules,
      lessons,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch learning path",
      error: error.message,
    });
  }
};

const updateCourse = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    category,
    description,
    level,
    estimatedMinutes,
    totalXp,
    tags,
    outcomes,
    isPublished,
  } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid path ID format" });
    }

    const foundPath = await learningPath.findById(id);
    if (!foundPath) {
      return res.status(404).json({ message: "Learning path not found" });
    }

    if (
      req.user.role !== "Admin" &&
      foundPath.createdBy.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "Unauthorized - You can only update your own paths",
      });
    }

    if (title !== undefined) {
      foundPath.title = title;
      foundPath.slug = slugify(title);
    }
    if (category !== undefined) {
      const validCategoryId = await resolveValidCategoryId(category);
      if (!validCategoryId) {
        return res
          .status(400)
          .json({ message: "Invalid or inactive category" });
      }
      foundPath.category = validCategoryId;
    }
    if (description !== undefined) foundPath.description = description;
    if (level !== undefined) foundPath.level = level;
    if (estimatedMinutes !== undefined)
      foundPath.estimatedMinutes = estimatedMinutes;
    if (totalXp !== undefined) foundPath.totalXp = totalXp;
    if (tags !== undefined)
      foundPath.tags = Array.isArray(tags) ? tags : String(tags).split(",");
    if (outcomes !== undefined) {
      foundPath.outcomes = Array.isArray(outcomes)
        ? outcomes
        : String(outcomes).split(",");
    }
    if (isPublished !== undefined) foundPath.isPublished = isPublished;
    if (req.file || req.body.thumbnail !== undefined) {
      foundPath.thumbnail = req.file?.location ?? req.body.thumbnail;
    }

    const updatedPath = await foundPath.save();

    return res.status(200).json({
      message: "Learning path updated successfully",
      course: updatedPath,
      path: updatedPath,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update learning path",
      error: error.message,
    });
  }
};

const deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid path ID format" });
    }

    const foundPath = await learningPath.findById(id);
    if (!foundPath) {
      return res.status(404).json({ message: "Learning path not found" });
    }

    if (
      req.user.role !== "Admin" &&
      foundPath.createdBy.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "Unauthorized - You can only delete your own paths",
      });
    }

    await foundPath.deleteOne();
    return res
      .status(200)
      .json({ message: "Learning path deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete learning path",
      error: error.message,
    });
  }
};

const getAdminCourses = async (req, res) => {
  try {
    const paths = await learningPath
      .find({})
      .populate("createdBy", "firstName lastName email")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "All learning paths fetched successfully",
      courses: await attachStats(paths),
      paths,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch learning paths",
      error: error.message,
    });
  }
};

const adminToggleCoursePublish = async (req, res) => {
  const { id } = req.params;
  const { isPublished } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid path ID format" });
    }

    if (typeof isPublished !== "boolean") {
      return res.status(400).json({ message: "isPublished must be boolean" });
    }

    const updatedPath = await learningPath
      .findByIdAndUpdate(id, { isPublished }, { new: true })
      .populate("createdBy", "firstName lastName email")
      .populate("category", "name");

    if (!updatedPath) {
      return res.status(404).json({ message: "Learning path not found" });
    }

    return res.status(200).json({
      message: "Learning path publish status updated successfully",
      course: updatedPath,
      path: updatedPath,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update learning path publish status",
      error: error.message,
    });
  }
};

export {
  createCourse,
  getCourse,
  getTutorCourses,
  getTutorCourseById,
  getCourseById,
  updateCourse,
  deleteCourse,
  getAdminCourses,
  adminToggleCoursePublish,
};
