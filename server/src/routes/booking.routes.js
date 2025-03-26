import { Router } from "express";
import { addExtras, cancelBooking, checkCarAvailability, createBooking, getUserBookings, submitRating, updateBookingStatus, getBookingsForOwner, generateInvoice } from "../controllers/booking.controller.js";

const router = Router();

router.post('/create',createBooking);
router.get('/userbookings/:userId',getUserBookings);
router.put('/updatestatus/:bookingId',updateBookingStatus);
router.post('/cancel/:bookingId',cancelBooking);
router.get('/checkavailability',checkCarAvailability);
router.put('/addextras/:bookingId', addExtras); // Route for adding extras to a booking
router.post('/rate/:carId', submitRating); // Route for submitting a car rating
router.get('/ownerbookings/:ownerId', getBookingsForOwner); // Route for getting bookings for a car owner
router.get('/generateinvoice/:bookingId', generateInvoice); // Route for getting bookings for a car owner

export default router;