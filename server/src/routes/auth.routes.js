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
router.post('/injectadmin',injectAdminUser);
// Protected route
router.get('/protected', authenticate, (req, res) => {
    res.status(200).json({
        msg: "You are logged in and have accessed a protected route!",
        user: req.user
    });
});

export default router;