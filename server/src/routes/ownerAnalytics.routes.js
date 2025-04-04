import { Router } from "express";
import {
    bidAmountPerCar,
    getTotals,
    rentalDurationPerCar,
    revenueOverTime,
    totalBookingsPerCar,
    revenueByCar,
    carAvailabilityInsights,
    rentalTypeDistribution,
    categoryPerformance,
    peakBookingHours
} from "../controllers/ownerAnalytics.controller.js";
import { cacheMiddleware } from "../middlewares/redis.middleware.js";

const router = Router();

/** @description Gets the count of @var totalBookings @var totalBids @var totalRevenue @var totalCars */
router.post('/getTotalCount', cacheMiddleware('owner:getTotalCount'), getTotals);
router.post('/bookingspercar', cacheMiddleware('owner:bookingsPerCar'), totalBookingsPerCar);
router.post('/rentaldurationpercar', cacheMiddleware('owner:rentalDurationPerCar'), rentalDurationPerCar);
router.post('/revenueovertime', cacheMiddleware('owner:revenueOverTime'), revenueOverTime);
router.post('/bidamountovertime', cacheMiddleware('owner:bidAmountPerCar'), bidAmountPerCar);
router.post('/revenuebycar', cacheMiddleware('owner:revenueByCar'), revenueByCar);
router.post('/caravailabilityinsights', cacheMiddleware('owner:carAvailabilityInsights'), carAvailabilityInsights);
router.post('/rentaltypedistribution', cacheMiddleware('owner:rentalTypeDistribution'), rentalTypeDistribution);
router.post('/categoryperformance', cacheMiddleware('owner:categoryPerformance'), categoryPerformance);
router.post('/peakbookinghours', cacheMiddleware('owner:peakBookingHours'), peakBookingHours);

export default router;  