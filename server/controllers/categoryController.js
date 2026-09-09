// Category controller logic.
import { getAllCategories } from "../models/Category.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });
  }
};