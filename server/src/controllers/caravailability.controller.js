import CarAvailability from "../models/carAvailability.model.js";

/**
 * @function createCarAvailability
 * @description Create a new car availability record.
 * @param {*} req
 * @param {*} res
 */
export const createCarAvailability = async (req, res) => {
    try {
        const { carId, fromTimestamp, toTimestamp } = req.body;

        // Validate input
        if (!carId || !fromTimestamp || !toTimestamp) {
            return res.status(400).json({ msg: "Missing required fields" });
        }

        // Create a new availability record
        const carAvailability = new CarAvailability({
            carId,
            fromTimestamp,
            toTimestamp,
        });

        const savedAvailability = await carAvailability.save();
        res.status(201).json({ msg: "Car availability created successfully", savedAvailability });
    } catch (error) {
        console.error("CarAvailability Controller :: Error creating car availability", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function getCarAvailability
 * @description Get all availability records for a specific car.
 * @param {*} req
 * @param {*} res
 */
export const getCarAvailability = async (req, res) => {
    try {
        const { carId } = req.params;

        // Validate input
        if (!carId) {
            return res.status(400).json({ msg: "Car ID is required" });
        }

        const availabilityRecords = await CarAvailability.find({ carId });
        res.status(200).json({ availabilityRecords });
    } catch (error) {
        console.error("CarAvailability Controller :: Error fetching car availability", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function updateCarAvailability
 * @description Update an existing car availability record.
 * @param {*} req
 * @param {*} res
 */
export const updateCarAvailability = async (req, res) => {
    try {
        const { availabilityId } = req.params;
        const { fromTimestamp, toTimestamp } = req.body;

        // Validate input
        if (!fromTimestamp || !toTimestamp) {
            return res.status(400).json({ msg: "Missing required fields" });
        }

        const updatedAvailability = await CarAvailability.findByIdAndUpdate(
            availabilityId,
            { fromTimestamp, toTimestamp },
            { new: true }
        );

        if (!updatedAvailability) {
            return res.status(404).json({ msg: "Car availability record not found" });
        }

        res.status(200).json({ msg: "Car availability updated successfully", updatedAvailability });
    } catch (error) {
        console.error("CarAvailability Controller :: Error updating car availability", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function deleteCarAvailability
 * @description Delete a car availability record.
 * @param {*} req
 * @param {*} res
 */
export const deleteCarAvailability = async (req, res) => {
    try {
        const { availabilityId } = req.params;

        const deletedAvailability = await CarAvailability.findByIdAndDelete(availabilityId);

        if (!deletedAvailability) {
            return res.status(404).json({ msg: "Car availability record not found" });
        }

        res.status(200).json({ msg: "Car availability deleted successfully", deletedAvailability });
    } catch (error) {
        console.error("CarAvailability Controller :: Error deleting car availability", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};

/**
 * @function checkCarAvailability
 * @description Check if a car is available for a given time range.
 * @param {*} req
 * @param {*} res
 */
export const checkCarAvailability = async (req, res) => {
    try {
        const { carId, fromTimestamp, toTimestamp } = req.body;

        // Validate input
        if (!carId || !fromTimestamp || !toTimestamp) {
            return res.status(400).json({ msg: "Missing required fields" });
        }

        const overlappingRecords = await CarAvailability.find({
            carId,
            $or: [
                { fromTimestamp: { $lt: toTimestamp }, toTimestamp: { $gt: fromTimestamp } },
            ],
        });

        const isAvailable = overlappingRecords.length === 0;

        res.status(200).json({ isAvailable });
    } catch (error) {
        console.error("CarAvailability Controller :: Error checking car availability", error);
        res.status(500).json({ msg: "Server Error", details: error.message });
    }
};