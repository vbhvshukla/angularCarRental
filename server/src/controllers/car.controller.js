import mongoose from "mongoose";
import { Car } from "../models/car.model.js";

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
        //Extract the rating from the data being sent in the request.
        const { rating, ...carData } = req.body;

        //Create the car object.
        const newCar = new Car({
            ...carData,
            owner: {
                _id: req.user._id,
                username: req.user.username,
                email: req.user.email
            },
            rating: rating || { avgRating: 0, ratingCount: 0 }
        });

        //Send the saved car as response.
        const savedCar = await newCar.save();
        res.status(201).json({
            msg: "Car Controller :: Car Created Successfully!",
            car: savedCar
        });
    } catch (error) {
        console.error("Car Controller :: Error Creating Car", error);
        res.status(500).json({ msg: "Car Controller :: Server Error while creating car", details: error.message });
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
        console.log("Server :: Car Controller :: Get Cars By Owner ::", ownerId)
        // const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
        const cars = await Car.find({ "owner._id": ownerId, isDeleted: false });
        console.log("Server :: Car Controller :: Get Cars By Owner ::", cars)
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
        const { carId } = req.params;
        const carData = req.body;
        console.log(`Server:: Car Controller :: Car Id:${carId} :: CarData :: ${carData}`)
        const car = await Car.findByIdAndUpdate(carId, carData, { new: true });
        if (!car) {
            return res.status(404).json({ msg: "Car not found" });
        }
        res.status(200).json({ msg: "Car updated successfully", car });
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
        const { page = 1, limit = "10", location, category, priceRange, availability, rentalType } = req.body;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Build the query object
        const query = {
            isDeleted: false,
            $or: [
                { isAvailableForLocal: true },
                { isAvailableForOutstation: true }
            ]
        };

        // Add filters to the query
        if (location) query.city = location;
        if (category) query["category._id"] = category;
        if (priceRange) query.price = { $lte: parseInt(priceRange) };
        if (availability) query.availability = availability;
        if (rentalType) {
            query[`isAvailableFor${rentalType.charAt(0).toUpperCase() + rentalType.slice(1)}`] = true;
        }

        // Pagination
        const skip = (parseInt(pageNumber) - 1) * parseInt(limitNumber);
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