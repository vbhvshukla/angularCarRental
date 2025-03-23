import { Router } from "express";
import { bidAmountPerCar, getTotals, rentalDurationPerCar, revenueOverTime, totalBookingsPerCar } from "../controllers/ownerAnalytics.controller.js";

const router = Router();

/** @description Gets the count of @var totalBookings @var totalBids @var totalRevenue @var totalCars */
router.post('/getTotalCount', getTotals);
router.post('/bookingspercar', totalBookingsPerCar);
router.post('/rentaldurationpercar', rentalDurationPerCar);
router.post('/revenueovertime', revenueOverTime);
router.post('/bidamountovertime', bidAmountPerCar);

export default router;  