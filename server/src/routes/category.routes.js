import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/category.controller.js";

const router = Router();

router.post('/create', createCategory);
router.get('/getallcategories', getAllCategories);
router.get('/getcategory/:categoryId', getCategoryById);
router.put('/update/:categoryId', updateCategory);
router.delete('/delete/:categoryId', deleteCategory);

export default router;