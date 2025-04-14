import { Router } from "express";
import {
    getUserById,
    getAllUsers,
    approveUser,
    rejectUser,
    updatePassword,
    validatePassword
} from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

/** Router Instance */
const router = Router();

/** Routes */
router.get("/:userId", getUserById);

router.get("/", authenticate, authorize("admin"), getAllUsers);

router.put("/approve/:userId", authenticate, authorize("admin"), approveUser);

router.put("/reject/:userId", authenticate, authorize("admin"), rejectUser);

router.put("/password/:userId", authenticate, updatePassword);

router.post('/validatepassword', authenticate, validatePassword);

export default router;