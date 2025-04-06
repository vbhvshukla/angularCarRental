import { Router } from "express";
import { createCar, deleteCar, getAllCars, getAvailableCars, getCarById, getCarsByCategory, getCarsByCity, getCarsByOwner, updateCar } from "../controllers/car.controller.js";
import { authorize, authenticate } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/create",
    authenticate,
    authorize("owner"),
    upload.array("images"), // Handle multiple image uploads
    createCar);
router.get("/", getAllCars); // Get all cars
router.get("/owner/:ownerId", authenticate, authorize("owner"), getCarsByOwner); // Get cars by owner
router.get("/getcar/:carId", getCarById); // Get car by ID
router.get("/category/:categoryId", getCarsByCategory); // Get cars by category
router.get("/city/:city", getCarsByCity); // Get cars by city
router.get("/available", getAvailableCars); // Get all available cars

router.put("/update/:carId",
    authenticate,
    authorize("owner"),
    upload.array("images"), // Handle multiple image uploads
    updateCar); // Update car details

router.delete("/:carId", [
    authenticate,
    authorize("owner"),
], deleteCar); // Soft delete a car

export default router;