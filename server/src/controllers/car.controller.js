import mongoose from "mongoose";
import { Car } from "../models/car.model.js";
import { Booking } from "../models/booking.model.js";

/**
 * Adding a new car.
 * @description Adds a new car in the DB.
 * @async
 * @param {*} req 
 * @param {*} res 
 * @returns {*} 
 */
export const createCar = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Debug log for req.body
        console.log("Request Files:", req.files); // Debug log for req.files

        const carData = JSON.parse(req.body.carData); // Parse car data from FormData
        console.log(carData);
        const imageUrls = req.files.map(file => file.location); // Extract S3 URLs from multer

        const newCar = new Car({
            ...carData,
            images: imageUrls, // Save S3 URLs in the database
            owner: {
                _id: req.user._id,
                username: req.user.username,
                email: req.user.email
            },
            rating: carData.rating || { avgRating: 0, ratingCount: 0 }
        });

        const savedCar = await newCar.save();
        res.status(201).json({
            msg: "Car created successfully!",
            car: savedCar
        });
    } catch (error) {
        console.error("Car Controller :: Error creating car", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * Get all cars.
 * @description Fetches all cars from the database.
* @async
 * @param {*} req
 * @param {*} res
 */
export const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find({ isDeleted: false });
        res.status(200).json(cars);
    } catch (error) {
        console.error("Car Controller :: Error fetching all cars", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function getCarById
 * @description Fetch a car by its ID.
 * @param {*} req
 * @param {*} res
 */
export const getCarById = async (req, res) => {
    try {
        const { carId } = req.params;
        const car = await Car.findById(carId);
        if (!car || car.isDeleted) {
            return res.status(404).json({ msg: "Car not found" });
        }
        res.status(200).json(car);
    } catch (error) {
        console.error("Car Controller :: Error fetching car by ID", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function getCarsByOwner
 * @description Fetch all cars owned by a specific owner.
 * @param {*} req
 * @param {*} res
 */
export const getCarsByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        // console.log("Server :: Car Controller :: Get Cars By Owner ::", ownerId)
        // const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
        const cars = await Car.find({ "owner._id": ownerId, isDeleted: false });
        // console.log("Server :: Car Controller :: Get Cars By Owner ::", cars)
        res.status(200).json(cars);
    } catch (error) {
        console.error("Car Controller :: Error fetching cars by owner", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function getCarsByCategory
 * @description Fetch all cars in a specific category.
 * @param {*} req
 * @param {*} res
 */
export const getCarsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const cars = await Car.find({ "category._id": categoryId, isDeleted: false });
        res.status(200).json(cars);
    } catch (error) {
        console.error("Car Controller :: Error fetching cars by category", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function getCarsByCity
 * @description Fetch all cars available in a specific city.
 * @param {*} req
 * @param {*} res
 */
export const getCarsByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const cars = await Car.find({ city: city, isDeleted: false });
        res.status(200).json(cars);
    } catch (error) {
        console.error("Car Controller :: Error fetching cars by city", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};


/**
 * @function updateCar
 * @description Update an existing car's details.
 * @param {*} req
 * @param {*} res
 */
export const updateCar = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Debug log for req.body
        console.log("Request Files:", req.files); // Debug log for req.files

        const { carId } = req.params;
        const carData = JSON.parse(req.body.carData); // Parse car data from FormData
        const imageUrls = req.files.map(file => file.location); // Extract S3 URLs from multer

        const updatedCar = await Car.findByIdAndUpdate(
            carId,
            { ...carData, ...(imageUrls.length > 0 && { images: imageUrls }) },
            { new: true }
        );

        if (!updatedCar) {
            return res.status(404).json({ msg: "Car not found" });
        }

        res.status(200).json({ msg: "Car updated successfully", car: updatedCar });
    } catch (error) {
        console.error("Car Controller :: Error updating car", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function deleteCar
 * @description Soft delete a car by marking it as deleted.
 * @param {*} req
 * @param {*} res
 */
export const deleteCar = async (req, res) => {
    try {
        const { carId } = req.params;
        const car = await Car.findByIdAndUpdate(carId, { isDeleted: true }, { new: true });
        if (!car) {
            return res.status(404).json({ msg: "Car not found" });
        }
        await Booking.updateMany({ "car.carId": carId }, { status: "cancelled" });
        res.status(200).json({ msg: "Car deleted successfully" });
    } catch (error) {
        console.error("Car Controller :: Error deleting car", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function getAvailableCars
 * @description Fetch all cars that are currently available.
 * @param {*} req
 * @param {*} res
 */
export const getAvailableCars = async (req, res) => {
    try {
        const { page = 1, limit = 10, location, carCategory, priceRange, carType, availability, features, rating } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        console.log(pageNumber, limitNumber);
        const query = {
            isDeleted: false,
            ...(availability
                ? {
                    [availability === "local" ? "isAvailableForLocal" : "isAvailableForOutstation"]: true
                }
                : {
                    $or: [
                        { isAvailableForLocal: true },
                        { isAvailableForOutstation: true }
                    ]
                })
        };

        if (location) query.city = location;
        if (carCategory) query["category._id"] = new mongoose.Types.ObjectId(carCategory);
        if (priceRange) query["rentalOptions.local.pricePerHour"] = { $lte: parseInt(priceRange) };
        if (carType) query.carType = carType;
        // if (availability) query.availability = availability;
        if (features) query.features = { $regex: features, $options: "i" };
        if (rating) query["rating.avgRating"] = { $gte: parseInt(rating) };


        const skip = (pageNumber - 1) * limitNumber;
        console.log(query);
        const cars = await Car.aggregate([
            { $match: query },
            {
                $facet: {
                    cars: [{ $skip: skip }, { $limit: limitNumber }],
                    total: [{ $count: "count" }]
                }
            }
        ]);
        const total = cars[0]?.total[0]?.count || 0;
        res.status(200).json({ cars: cars[0]?.cars || [], total });
    } catch (error) {
        console.error("Car Controller :: Error fetching available cars", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

export const rateCar = async (req, res) => {
    try {
        const { rating, bookingId } = req.body;
        const { carId } = req.params;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ msg: "Rating must be between 1 and 5" });
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ msg: "Car not found" });
        }

        const oldRating = car.rating;
        const newRatingCount = oldRating.ratingCount + 1;
        const newAvgRating = ((oldRating.avgRating * oldRating.ratingCount) + rating) / newRatingCount;

        const updatedRating = {
            avgRating: newAvgRating,
            ratingCount: newRatingCount
        };

        const updatedCar = await Car.findByIdAndUpdate(
            carId,
            { rating: updatedRating },
            { new: true }
        );

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { isRated: true },
            { new: true }
        )
        console.log('Rated');
        res.status(200).json({
            msg: "Rating added successfully",
            car: updatedCar,
            booking : updatedBooking
        });

    } catch (error) {
        console.error("Car Controller :: Error adding rating", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
}