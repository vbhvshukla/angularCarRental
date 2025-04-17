import { Booking } from "../models/booking.model.js";
import { Car } from "../models/car.model.js";
import { sendEmail } from "../services/mail.service.js";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import upload from "../middlewares/upload.middleware.js";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { dirname } from "path";
PDFDocument
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

        const car = await Car.findById(bookingData.bid.car.carId);
        if (!car) {
            return res.status(404).json({ msg: "Car not found" });
        }

        const calculatedBaseFare = calculateBaseFare(bookingData.bid, car);
        const calculatedTotalAmount = calculateTotalAmount(bookingData.bid, calculatedBaseFare);


        const booking = new Booking({
            fromTimestamp: bookingData.bid.fromTimestamp,
            toTimestamp: bookingData.bid.toTimestamp,
            status: "confirmed",
            rentalType: bookingData.bid.rentalType,
            bid: {
                fromTimestamp: bookingData.bid.fromTimestamp,
                toTimestamp: bookingData.bid.toTimestamp,
                status: 'accepted',
                bidAmount: bookingData.bid.bidAmount,
                bidBaseFare: bookingData.bid.bidBaseFare,
                rentalType: bookingData.bid.rentalType,
                user: {
                    userId: bookingData.bid.user.userId,
                    username: bookingData.bid.user.username,
                    email: bookingData.bid.user.email,
                    role: bookingData.bid.user.role
                },
                car: {
                    carId: bookingData.bid.car.carId,
                    carName: bookingData.bid.car.carName,
                    carType: bookingData.bid.car.carType,
                    city: bookingData.bid.car.city,
                    createdAt: bookingData.bid.car.createdAt,
                    isAvailableForLocal: bookingData.bid.car.isAvailableForLocal,
                    isAvailableForOutstation: bookingData.bid.car.isAvailableForOutstation,
                    category: {
                        categoryId: bookingData.bid.car.category.categoryId,
                        categoryName: bookingData.bid.car.category.categoryName
                    },
                    owner: {
                        userId: bookingData.bid.car.owner.userId,
                        username: bookingData.bid.car.owner.username,
                        email: bookingData.bid.car.owner.email,
                    },
                    rentalOptions: bookingData.bid.car.rentalOptions
                }
            },
            baseFare: calculatedBaseFare,
            extraKmCharges: 0,
            extraHourCharges: 0,
            extraDayCharges: 0,
            totalFare: calculatedTotalAmount,
        });

        const newBooking = await booking.save();
        const emailContent = `
            <h1>Booking Confirmation</h1>
            <p>Dear ${booking.bid.user.username},</p>
            <p>Your booking has been successfully created. Here are the details:</p>
            <ul>
                <li><strong>Car Name:</strong> ${booking.bid.car.carName}</li>
                <li><strong>From:</strong> ${new Date(booking.bid.fromTimestamp).toLocaleString()}</li>
                <li><strong>To:</strong> ${new Date(booking.bid.toTimestamp).toLocaleString()}</li>
                <li><strong>Total Fare:</strong> $${calculatedTotalAmount}</li>
                <li><strong>Status:</strong> Confirmed</li>
            </ul>
            <p>Thank you for choosing our service!</p>
        `;
        await sendEmail({
            to: booking.bid.user.email,
            subject: "Booking Confirmation",
            html: emailContent,
        });
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
        const { carId, fromTimestamp, toTimestamp } = req.query;

        console.log(carId, fromTimestamp, toTimestamp);

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
        console.log('getting in addextras')
        const { bookingId } = req.params;
        const { extras } = req.body;
        console.log(bookingId, extras);

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
            extraKmCharges = car.rentalOptions.local.extraKmRate * extras.extraKm;
            extraHourCharges = car.rentalOptions.local.extraHourlyRate * extras.extraHr;
        } else if (booking.rentalType === "outstation") {
            extraKmCharges = car.rentalOptions.outstation.extraKmRate * extras.extraKm;
            extraHourCharges = car.rentalOptions.outstation.extraHourRate * extras.extraHr;
            extraDayCharges = car.rentalOptions.outstation.extraDayRate * extras.extraDay;
        }

        booking.extraKmCharges += extraKmCharges;
        booking.extraHourCharges += extraHourCharges;
        booking.extraDayCharges += extraDayCharges;
        booking.totalFare += extraKmCharges + extraHourCharges + extraDayCharges;
        booking.status = 'completed';

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
        const { page = 1, limit = 10, bookingType, carId } = req.query;

        // Build the query
        const query = { "bid.car.owner.userId": ownerId };
        if (bookingType && bookingType !== 'all') {
            query.rentalType = bookingType;
        }
        if (carId) {
            query["bid.car.carId"] = carId;
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

//this is the absolute path of the current file.

const __filename = fileURLToPath(import.meta.url);

//get the directory name as well.
const __dirname = dirname(__filename);

export const generateInvoice = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const bookingData = await Booking.findById(bookingId);

        if (!bookingData) {
            return res.status(404).json({ msg: "Booking not found" });
        }

        //this is the path at which the file would be crated at.
        const tempFilePath = path.join(__dirname, `invoice_${bookingId}.pdf`);

        //create new doc 
        const doc = new PDFDocument();

        //craete a writable stream to which we pass the data.
        const writeStream = fs.createWriteStream(tempFilePath);

        // when the pdf document is created we send this content to the writeStream which will write it to the file.
        doc.pipe(writeStream);

        doc.font('Helvetica-Bold').fontSize(20).text("Booking Invoice", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Booking ID: ${bookingData._id}`);
        doc.text(`Car Name: ${bookingData.bid.car.carName}`);
        doc.text(`From: ${new Date(bookingData.bid.fromTimestamp).toLocaleString()}`);
        doc.text(`To: ${new Date(bookingData.bid.toTimestamp).toLocaleString()}`);
        doc.text(`Total Fare: Rs.${bookingData.totalFare}`);
        doc.text(`Status: ${bookingData.status}`);
        doc.end();

        await new Promise((resolve, reject) => {
            writeStream.on("finish", resolve);
            writeStream.on("error", reject);
        });

        const s3Upload = await new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(tempFilePath); //read the file as stream and send it to body of aws s3
            upload.storage.s3.upload(
                {
                    Bucket: "restroworkscarental",
                    Key: `invoices/invoice_${bookingId}.pdf`,
                    Body: fileStream,
                },
                (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                }
            );
        });

        const emailContent = `
            Dear ${bookingData.bid.user.username},
            
            Please find attached the invoice for your booking.
            
            Thank you for choosing Carental
        `;
        await sendEmail({
            to: bookingData.bid.user.email,
            subject: "Booking Invoice",
            text: emailContent,
            attachments: [
                {
                    filename: `invoice_${bookingId}.pdf`,
                    path: tempFilePath,
                },
            ],
        });
        //delete or unlink the file from tempFilePath
        await promisify(fs.unlink)(tempFilePath);
        res.status(200).json({ msg: "Invoice generated and sent successfully", s3Url: s3Upload.Location });
    } catch (error) {
        console.error("Booking Controller :: Error generating invoice", error);
        res.status(500).json({ msg: "Server Error" });
    }
};