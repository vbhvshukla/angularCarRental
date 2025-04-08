import { Router } from "express";
import { registerUser, upload } from "../utils/imports.js";
import { getCurrentUser, injectAdminUser, loginUser, logout, regenerateToken } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateLogin, validateRegister } from "../services/authValidator.service.js";


/** Router Instance */
const router = Router();

router.post('/register', upload.single('verificationFile'), registerUser)
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/regenerateToken', regenerateToken);
router.get('/getcurrentuser', getCurrentUser);
router.post('/injectadmin', injectAdminUser);
export default router;