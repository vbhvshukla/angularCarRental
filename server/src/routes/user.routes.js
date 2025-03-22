import { Router } from "express";
import {
    getUserById,
    getAllUsers,
    approveUser,
    rejectUser,
    updatePassword,
    validatePassword
} from "../controllers/user.controller.js";

/** Router Instance */
const router = Router();

/** Routes */
router.get("/:userId", getUserById);

router.get("/", getAllUsers);

router.put("/approve/:userId", approveUser);

router.put("/reject/:userId", rejectUser);

router.put("/password/:userId", updatePassword);

router.post('/validatepassword', validatePassword);

export default router;