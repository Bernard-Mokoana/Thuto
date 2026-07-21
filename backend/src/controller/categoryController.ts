import { Request, Response } from "express";
import { category } from "../model/category.ts";
import mongoose from "mongoose";

const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description, icon, color, parentCategory, sortOrder } =
    req.body;

  if (!name?.trim()) {
    res.status(400).json({ message: "Category name is required" });
    return;
  }

  try {
    const normalizedName = name.trim();
    const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingCategory = await category.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, "i") },
    });

    if (existingCategory) {
      res.status(400).json({ message: "Category already exists" });
      return;
    }

    let resolvedParentCategory: mongoose.Types.ObjectId | undefined;
    if (parentCategory) {
      if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
        res.status(400).json({ message: "Invalid parent category id" });
        return;
      }

      const parentExists = await category
        .findOne({ _id: parentCategory, isActive: true })
        .select("_id");

      if (!parentExists) {
        res.status(404).json({ message: "Parent category not found" });
        return;
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

    res.status(201).json({
      message: "Category created successfully",
      category: createdCategory,
    });
  } catch (error) {
    console.error("Failed to create a category:", error);
    res
      .status(500)
      .json({
        message: "Failed to create a category",
        error: error instanceof Error ? error.message : String(error),
      });
  }
};

const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await category
      .find({ isActive: true })
      .sort({ name: 1 });
    res.status(200).json({ categories });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch categories",
        error: error instanceof Error ? error.message : String(error),
      });
  }
};

export { getAllCategories, createCategory };
