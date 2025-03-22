import { Router } from "express";
import {
    createCarAvailability,
    getCarAvailability,
    updateCarAvailability,
    deleteCarAvailability,
    checkCarAvailability,
} from "../controllers/caravailability.controller.js";

const router = Router();

// Create a new car availability record
router.post("/create", createCarAvailability);

// Get all availability records for a specific car
router.get("/:carId", getCarAvailability);

// Update an existing car availability record
router.put("/update/:availabilityId", updateCarAvailability);

// Delete a car availability record
router.delete("/delete/:availabilityId", deleteCarAvailability);

// Check if a car is available for a given time range
router.post("/check", checkCarAvailability);

export default router;