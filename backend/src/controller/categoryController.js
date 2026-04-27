import { category } from "../model/category.js";
import mongoose from "mongoose";

const createCategory = async (req, res) => {
  const { name, description, icon, color, parentCategory, sortOrder } =
    req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const normalizedName = name.trim();
    const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingCategory = await category.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    let resolvedParentCategory = undefined;
    if (parentCategory) {
      if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
        return res.status(400).json({ message: "Invalid parent category id" });
      }

      const parentExists = await category
        .findOne({ _id: parentCategory, isActive: true })
        .select("_id");

      if (!parentExists) {
        return res.status(404).json({ message: "Parent category not found" });
      }

      resolvedParentCategory = parentExists._id;
    }

    const createdCategory = await category.create({
      name: normalizedName,
      description: description?.trim(),
      icon: icon?.trim(),
      color: color?.trim(),
      parentCategory: resolvedParentCategory,
      sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
    });

    return res.status(201).json({
      message: "Category created successfully",
      category: createdCategory,
    });
  } catch (error) {
    console.error("Failed to create a category:", error);
    return res
      .status(500)
      .json({ message: "Failed to create a category", error: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await category
      .find({ isActive: true })
      .sort({ name: 1 });
    res.status(200).json({ categories });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch categories", error: error.message });
  }
};

export { getAllCategories, createCategory };
