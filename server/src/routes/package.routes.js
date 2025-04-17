import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { createPackage, getAllPackages, getPackageById, markPackageInactive, updatePackage } from "../controllers/package.controller.js";

const router = Router();

router.get("/allpackages", getAllPackages);

router.post("/create", authenticate, authorize("owner"),upload.array("images"), createPackage);

router.put("/update/:packageId", authenticate, authorize("owner"), upload.array("images"), updatePackage);

router.put("/markInactive", authenticate, authorize("owner"), markPackageInactive);

router.get("/:packageId", authenticate, authorize("owner"), getPackageById);

export default router;