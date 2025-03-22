import { Category } from "../models/category.model.js";

/**
 * @function getAllCategories
 * @description Fetch all categories from the database.
 * @param {*} req
 * @param {*} res
 */
export const getAllCategories = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const categories = await Category.find()
            .skip((page - 1) * limit)
            .limit(limit);
        res.status(200).json(categories);
    } catch (error) {
        console.error("Category Controller :: Error fetching all categories", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function getCategoryById
 * @description Fetch a category by its ID.
 * @param {*} req
 * @param {*} res
 */
export const getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ msg: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error("Category Controller :: Error fetching category by ID", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function createCategory
 * @description Create a new category.
 * @param {*} req
 * @param {*} res
 */
export const createCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;

        if (!categoryName || categoryName.length < 2 || categoryName.length > 50) {
            return res.status(400).json({ msg: "Invalid category name" });
        }

        const category = new Category({ categoryName });
        await category.save();

        res.status(201).json({ msg: "Category created successfully", category });
    } catch (error) {
        console.error("Category Controller :: Error creating category", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function updateCategory
 * @description Update an existing category.
 * @param {*} req
 * @param {*} res
 */
export const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { categoryName } = req.body;

        if (!categoryName || categoryName.length < 2 || categoryName.length > 50) {
            return res.status(400).json({ msg: "Invalid category name" });
        }

        const category = await Category.findByIdAndUpdate(
            categoryId,
            { categoryName },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ msg: "Category not found" });
        }

        res.status(200).json({ msg: "Category updated successfully", category });
    } catch (error) {
        console.error("Category Controller :: Error updating category", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function deleteCategory
 * @description Delete a category by its ID.
 * @param {*} req
 * @param {*} res
 */
export const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.findByIdAndDelete(categoryId);

        if (!category) {
            return res.status(404).json({ msg: "Category not found" });
        }

        res.status(200).json({ msg: "Category deleted successfully" });
    } catch (error) {
        console.error("Category Controller :: Error deleting category", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};