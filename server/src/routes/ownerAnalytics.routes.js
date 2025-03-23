import { Router } from "express";
import { bidAmountPerCarOverTime, getTotals, rentalDurationPerCar, revenueOverTime, totalBookingsPerCar } from "../controllers/ownerAnalytics.controller.js";

const router = Router();

/** @description Gets the count of @var totalBookings @var totalBids @var totalRevenue @var totalCars */
router.get('/getTotalCount', getTotals);
router.get('/bookingspercar', totalBookingsPerCar);
router.get('/rentaldurationpercar', rentalDurationPerCar);
router.get('/revenueovertime', revenueOverTime);
router.get('/bidamountovertime', bidAmountPerCarOverTime);

export default router;  