import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { createPackage, getAllPackages, markPackageInactive, updatePackage } from "../controllers/package.controller.js";

const router = Router();

router.get("/allpackages", getAllPackages);

router.post("/create", authenticate, authorize("owner"), createPackage);

router.put("/update/:packageId", authenticate, authorize("owner"), upload.array("images"), updatePackage);

router.put("/markInactive", authenticate, authorize("owners"), markPackageInactive);

export default router;