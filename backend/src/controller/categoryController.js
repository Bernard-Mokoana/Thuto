import { category } from "../model/category.js";

const getAllCategories = async (req, res) => {
  try {
    const categories = await category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};

export { getAllCategories };
