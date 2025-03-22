import { Booking } from "../models/booking.model.js";
import { Car } from "../models/car.model.js";

/**
 * @function createBooking
 * @description Create a new booking.
 * @param {*} req
 * @param {*} res
 */
export const createBooking = async (req, res) => {
    try {
        const bookingData = req.body;

        if (!bookingData || !bookingData.fromTimestamp || !bookingData.toTimestamp) {
            return res.status(400).json({ msg: "Missing required booking information" });
        }

        const car = await Car.findById(bookingData.car.carId);
        if (!car) {
            return res.status(404).json({ msg: "Car not found" });
        }

        const calculatedBaseFare = calculateBaseFare(bookingData, car);
        const calculatedTotalAmount = calculateTotalAmount(bookingData, calculatedBaseFare);

        const booking = new Booking({
            fromTimestamp: bookingData.fromTimestamp,
            toTimestamp: bookingData.toTimestamp,
            status: "confirmed",
            rentalType: bookingData.rentalType,
            bid: bookingData.bid,
            baseFare: calculatedBaseFare,
            extraKmCharges: 0,
            extraHourCharges: 0,
            extraDayCharges: 0,
            totalFare: calculatedTotalAmount,
        });

        const newBooking = await booking.save();
        res.status(201).json({ msg: "Booking created successfully", newBooking });
    } catch (error) {
        console.error("Booking Controller :: Error creating booking", error);
        res.status(500).json({ msg: "Server Error" });
    }
};

/**
 * @function getUserBookings
 * @description Get all bookings for a specific user.
 * @param {*} req
 * @param {*} res
 */
export const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const query = { "bid.user.userId": userId };
        if (req.query.bookingType && req.query.bookingType !== 'all') {
            query.rentalType = req.query.bookingType;
        }
        if (req.query.bidStatus && req.query.bidStatus !== 'all') {
            query["bid.status"] = req.query.bidStatus;
        }
        const bookings = await Booking.find(query)
            .skip((page - 1) * limit)
            .limit(limit);
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Booking Controller :: Error fetching user bookings", error);
        res.status(500).json({ msg: "Server Error" });
    }
};

/**
 * @function updateBookingStatus
 * @description Update the status of a booking.
 * @param {*} req
 * @param {*} res
 */
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { newStatus } = req.body;

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status: newStatus },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }

        res.status(200).json({ msg: "Booking status updated successfully", booking });
    } catch (error) {
        console.error("Booking Controller :: Error updating booking status", error);
        res.status(500).json({ msg: "Server Error" });
    }
};

/**
 * @function cancelBooking
 * @description Cancel a booking by its ID.
 * @param {*} req
 * @param {*} res
 */
export const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status: "cancelled" },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }

        res.status(200).json({ msg: "Booking cancelled successfully", booking });
    } catch (error) {
        console.error("Booking Controller :: Error cancelling booking", error);
        res.status(500).json({ msg: "Server Error" });
    }
};

/**
 * @function checkCarAvailability
 * @description Check if a car is available for the given dates.
 * @param {*} req
 * @param {*} res
 */
export const checkCarAvailability = async (req, res) => {
    try {
        const { carId, fromTimestamp, toTimestamp } = req.body;

        const overlappingBookings = await Booking.find({
            "bid.car.carId": carId,
            $or: [
                { fromTimestamp: { $lte: toTimestamp }, toTimestamp: { $gte: fromTimestamp } },
            ],
        });

        const isOverlapping = overlappingBookings.length > 0;

        res.status(200).json({ available: !isOverlapping });
    } catch (error) {
        console.error("Booking Controller :: Error checking car availability", error);
        res.status(500).json({ msg: "Server Error" });
    }
};

/**
 * @function addExtras
 * @description Add extra charges to a booking.
 * @param {*} req
 * @param {*} res
 */
export const addExtras = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { extraKm, extraHr, extraDay } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }

        const car = await Car.findById(booking.bid.car.carId);
        if (!car) {
            return res.status(404).json({ msg: "Car not found" });
        }

        let extraKmCharges = 0, extraHourCharges = 0, extraDayCharges = 0;

        if (booking.rentalType === "local") {
            extraKmCharges = car.rentalOptions.local.extraKmRate * extraKm;
            extraHourCharges = car.rentalOptions.local.extraHourRate * extraHr;
        } else if (booking.rentalType === "outstation") {
            extraKmCharges = car.rentalOptions.outstation.extraKmRate * extraKm;
            extraHourCharges = car.rentalOptions.outstation.extraHourlyRate * extraHr;
            extraDayCharges = car.rentalOptions.outstation.extraDayRate * extraDay;
        }

        booking.extraKmCharges += extraKmCharges;
        booking.extraHourCharges += extraHourCharges;
        booking.extraDayCharges += extraDayCharges;
        booking.totalFare += extraKmCharges + extraHourCharges + extraDayCharges;

        await booking.save();
        res.status(200).json({ msg: "Extras added successfully", booking });
    } catch (error) {
        console.error("Booking Controller :: Error adding extras", error);
        res.status(500).json({ msg: "Server Error" });
    }
};

/**
 * @function submitRating
 * @description Submit a rating for a car.
 * @param {*} req
 * @param {*} res
 */
export const submitRating = async (req, res) => {
    try {
        const { carId } = req.params;
        const { rating } = req.body;

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ msg: "Car not found" });
        }

        car.ratingCount = car.ratingCount ? car.ratingCount + 1 : 1;
        car.avgRating = ((car.avgRating * (car.ratingCount - 1)) + rating) / car.ratingCount;

        await car.save();
        res.status(200).json({ msg: "Rating submitted successfully", car });
    } catch (error) {
        console.error("Car Controller :: Error submitting rating", error);
        res.status(500).json({ msg: "Server Error" });
    }
};

/**
 * @function getBookingsForOwner
 * @description Get all bookings for a specific owner.
 * @param {*} req
 * @param {*} res
 */
export const getBookingsForOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { page = 1, limit = 10, bookingType } = req.query;

        // Build the query
        const query = { "bid.car.owner.userId": ownerId };
        if (bookingType && bookingType !== 'all') {
            query.rentalType = bookingType;
        }

        // Fetch total count and paginated bookings
        const totalItems = await Booking.countDocuments(query);
        const bookings = await Booking.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({ bookings, totalItems });
    } catch (error) {
        console.error("Booking Controller :: Error fetching bookings for owner", error);
        res.status(500).json({ msg: "Server Error" });
    }
};


/**
 * @function calculateBaseFare
 * @description Helper function to calculate the base fare for a booking.
 * @param {*} bookingData
 * @param {*} car
 * @returns {Number} Base fare
 */
const calculateBaseFare = (bookingData, car) => {
    const rentalType = bookingData.rentalType;
    const from = new Date(bookingData.fromTimestamp);
    const to = new Date(bookingData.toTimestamp);
    const diffTime = Math.abs(to - from);

    if (rentalType === "local") {
        const totalHours = diffTime / (1000 * 60 * 60);
        return car.rentalOptions.local.pricePerHour * totalHours;
    } else if (rentalType === "outstation") {
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return car.rentalOptions.outstation.pricePerDay * diffDays;
    }
    return 0;
};

/**
 * @function calculateTotalAmount
 * @description Helper function to calculate the total amount for a booking.
 * @param {*} bookingData
 * @param {*} baseFare
 * @returns {Number} Total amount
 */
const calculateTotalAmount = (bookingData, baseFare) => {
    const extraKmCharges = bookingData.extraKmCharges || 0;
    const extraHourCharges = bookingData.extraHourCharges || 0;
    const extraDayCharges = bookingData.extraDayCharges || 0;

    return baseFare + extraKmCharges + extraHourCharges + extraDayCharges;
};