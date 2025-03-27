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

const router = Router();

/** @description Gets the count of @var totalBookings @var totalBids @var totalRevenue @var totalCars */
router.post('/getTotalCount', getTotals);
router.post('/bookingspercar', totalBookingsPerCar);
router.post('/rentaldurationpercar', rentalDurationPerCar);
router.post('/revenueovertime', revenueOverTime);
router.post('/bidamountovertime', bidAmountPerCar);
router.post('/revenuebycar', revenueByCar);
router.post('/caravailabilityinsights', carAvailabilityInsights);
router.post('/rentaltypedistribution', rentalTypeDistribution);
router.post('/categoryperformance', categoryPerformance);
router.post('/peakbookinghours', peakBookingHours);

export default router;  