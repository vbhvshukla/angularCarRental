import { Router } from "express";

import {
    getTotals,
    revenueByRentalType,
    bookingTrends,
    topPerformingOwners,
    carsPerCategory,
    revenueByCity,
} from "../controllers/adminAnalytics.controller.js";

const router = Router();

// Route to get total users, bookings, bids, cars, and top bidders
router.post("/totals", getTotals);

// Routposto get revenue by city over time
router.post("/revenuebycity", revenueByCity);

// Routposto get revenue by rental type (local/outstation) over time
router.post("/revenuebyrentaltype", revenueByRentalType);

// Routposto get booking trends over time
router.post("/bookingtrends", bookingTrends);

// Routposto get top-performing owners
router.post("/topperformingowners", topPerformingOwners);

// Routposto get cars per category
router.post("/carspercategory", carsPerCategory);

export default router;