import { User } from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";
import { Bid } from "../models/bid.model.js";
import { Car } from "../models/car.model.js";

//Get totals
export const getTotals = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalBids = await Bid.countDocuments();
        const totalCars = await Car.countDocuments();
        const topBidders = await Bid.aggregate(
            [
                {
                    //group the documents by there user Id
                    $group: {
                        _id: "$user.userId",
                        totalBids: {
                            $sum: 1
                        }
                    },
                },
                //sort the bids in desceneding order
                {
                    $sort: {
                        totalBids: -1
                    }
                },
                //limit the results to the top 3 only
                {
                    $limit: 3
                },
            ]
        )
        res.status(200).json({
            totalUsers,
            totalBookings,
            totalBids,
            totalCars,
            topBidders
        });
    }
    catch (error) {
        console.error("Error fetching admin overview:", error);
        res.status(500).json({ msg: "Error fetching admin overview", error: error.message });
    }
}

//Revenue per city
export const revenueByCity = async (req, res) => {
    const { numberOfDays = 7 } = req.body;

    try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - numberOfDays);

        const revenueData = await Booking.aggregate(
            [
                {
                    //match the document by the where createdAt lies between startDate and today
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: today
                        },
                        status: {
                            $in: ['confirmed', 'completed']
                        }
                    }
                },
                {
                    $project: {
                        bid: 1,
                        createdAt: 1,
                        totalFare: 1
                    }
                },
                {
                    $group: {
                        //Group by two things the car's city and the date
                        _id: {
                            city: "$bid.car.city",
                            date: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$createdAt"
                                }
                            },
                        },
                        totalRevenue: {
                            $sum: "$totalFare"
                        }
                    }
                },
                {
                    //sort by date
                    $sort: {
                        "_id.date": 1
                    }
                }
            ]
        )
        res.status(200).json(revenueData);

    } catch (error) {
        console.error("Error fetching revenue by city over time:", error);
        res.status(500).json({ msg: "Error fetching revenue by city over time", error: error.message });
    }
}

//Revenue by rental type
export const revenueByRentalType = async (req, res) => {
    const { numberOfDays = 7 } = req.body;
    try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - numberOfDays);
        const revenueData = await Booking.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: today
                    },
                    status: {
                        $in: ['confirmed', 'completed']
                    }
                }
            },
            {
                $project: {
                    rentalType: 1,
                    totalRevenue: 1,
                    createdAt: 1,
                    totalFare: 1
                }
            },
            {
                //group by rental type and created at both 
                $group: {
                    _id: {
                        rentalType: "$rentalType",
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } // Group by date
                    },
                    totalRevenue: { $sum: "$totalFare" } // sum up totalFare
                }
            },
            {
                $sort: {
                    "_id.createdAt": 1
                }
            }
        ])
        res.status(200).json(revenueData);

    } catch (error) {
        console.error("Error fetching revenue by rental type over time:", error);
        res.status(500).json({ msg: "Error fetching revenue by rental type over time", error: error.message });
    }
}

//Bookings over time
export const bookingTrends = async (req, res) => {
    const { numberOfDays = 30 } = req.body;
    try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - numberOfDays);

        const bookingTrends = await Booking.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: today
                    },
                    status: {
                        $in: ['confirmed', 'completed']
                    }
                }
            },
            {
                $project: {
                    createdAt: 1,
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d", date: "$createdAt"
                        }
                    },
                    totalBookings: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    "_id": 1
                }
            }
        ])
        res.status(200).json(bookingTrends);
    } catch (error) {
        console.error("Error fetching booking trends over time:", error);
        res.status(500).json({ msg: "Error fetching booking trends over time", error: error.message });
    }
}

export const topPerformingOwners = async (req, res) => {
    try {
        const topOwners = await Booking.aggregate([
            {
                $match: {
                    status: {
                        $in: ['confirmed', 'completed']
                    }
                }
            },
            {
                $project: {
                    bid: 1,
                    totalFare: 1
                }
            },
            {
                //group by username -> calculate total revenue & bookings

                $group: {
                    _id: "$bid.car.owner.username",
                    totalRevenue: {
                        $sum: "$totalFare"
                    },
                    totalBookings: {
                        $sum: 1
                    }
                }
            },
            //sort by revenue largest first
            {
                $sort: {
                    totalRevenue: -1
                }
            },
            //limit it to 5 documents.
            {
                $limit: 5
            }
        ])
        res.status(200).json(topOwners);
    } catch (error) {
        console.error("Error fetching top performing owners:", error);
        res.status(500).json({ msg: "Error fetching top performing owners", error: error.message });
    }
}

export const carsPerCategory = async (req, res) => {
    try {
        const carsByCategory = await Car.aggregate([
            {
                $project: {
                    category: 1
                }
            },
            {
                $group: {
                    _id: "$category", // Group by category
                    totalCars: { $sum: 1 } // Count total cars per category
                }
            },
            { $sort: { totalCars: -1 } } // Sort by totalCars in descending order
        ]);
        res.status(200).json(carsByCategory);
    } catch (error) {
        console.error("Error fetching cars per category:", error);
        res.status(500).json({ msg: "Error fetching cars per category", error: error.message });
    }
}

export const customerRetentionAnalysis = async (req, res) => {
    const { numberOfDays = 90 } = req.body;
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - numberOfDays);

    try {
        const retentionData = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: today },
                    status: { $in: ['confirmed', 'completed'] }
                }
            },
            {
                $project: {
                    "bid.user.userId": 1,
                    "bid.user.username": 1,
                    totalFare: 1
                }
            },
            {
                $group: {
                    _id: "$bid.user.userId",
                    customerName: { $first: "$bid.user.username" },
                    totalRevenue: { $sum: "$totalFare" },
                    totalBookings: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    repeatCustomers: {
                        $sum: {
                            $cond: [{ $gt: ["$totalBookings", 1] }, 1, 0]
                        }
                    },
                    totalCustomers: { $sum: 1 },
                    totalRevenue: { $sum: "$totalRevenue" }
                }
            },
            {
                $project: {
                    retentionRate: {
                        $multiply: [{ $divide: ["$repeatCustomers", "$totalCustomers"] }, 100]
                    },
                    totalRevenue: 1
                }
            }
        ]);

        res.status(200).json(retentionData);
    } catch (error) {
        console.error("Error fetching customer retention analysis:", error);
        res.status(500).json({ msg: "Error fetching customer retention analysis", error: error.message });
    }
};

//Rental Duration Analytics
export const getRentalDurationAnalytics = async (req, res) => {
    const { numberOfDays = 30 } = req.body;
    try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - numberOfDays);

        const durationAnalytics = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: today },
                    status: { $in: ['confirmed', 'completed'] }
                }
            },
            {
                $project: {
                    rentalType: 1,
                    duration: {
                        $divide: [
                            { $subtract: ["$toTimestamp", "$fromTimestamp"] },
                            1000 * 60 * 60
                        ]
                    },
                    totalFare: 1,
                    "bid.car.category": 1,
                    "bid.car.city": 1
                }
            },
            {
                $group: {
                    _id: {
                        rentalType: "$rentalType",
                        city: "$bid.car.city",
                        category: "$bid.car.category.categoryName"
                    },
                    averageDuration: { $avg: "$duration" },
                    maxDuration: { $max: "$duration" },
                    minDuration: { $min: "$duration" },
                    totalBookings: { $sum: 1 },
                    averageFarePerHour: {
                        $avg: {
                            $divide: ["$totalFare", "$duration"]
                        }
                    }
                }
            },
            {
                $sort: {
                    "_id.city": 1,
                    "averageDuration": -1
                }
            }
        ]);
        res.status(200).json(durationAnalytics);
    } catch (error) {
        console.error("Error fetching rental duration analytics:", error);
        res.status(500).json({ msg: "Error fetching rental duration analytics", error: error.message });
    }
};

//Category Performance Analytics
export const getCategoryPerformance = async (req, res) => {
    const { numberOfDays = 30 } = req.body;
    try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - numberOfDays);

        const categoryPerformance = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: today },
                    status: { $in: ['confirmed', 'completed'] }
                }
            },
            {
                $project: {
                    categoryName: "$bid.car.category.categoryName", // Extract categoryName
                    createdAt: 1,
                    totalFare: 1,
                    rentalType: 1,
                    userId: "$bid.user.userId" // Extract userId for unique customers
                }
            },
            {
                $group: {
                    _id: {
                        category: "$categoryName", // Group by categoryName
                        date: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        }
                    },
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: "$totalFare" },
                    uniqueCustomers: { $addToSet: "$userId" }, // Collect unique user IDs
                    localBookings: {
                        $sum: { $cond: [{ $eq: ["$rentalType", "local"] }, 1, 0] }
                    },
                    outstationBookings: {
                        $sum: { $cond: [{ $eq: ["$rentalType", "outstation"] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    totalBookings: 1,
                    totalRevenue: 1,
                    uniqueCustomerCount: { $size: "$uniqueCustomers" }, // Count unique customers
                    revenuePerBooking: { $divide: ["$totalRevenue", "$totalBookings"] },
                    localBookings: 1,
                    outstationBookings: 1
                }
            },
            {
                $sort: {
                    "_id.date": 1, // Sort by date
                    "totalRevenue": -1 // Sort by revenue in descending order
                }
            }
        ]);

        res.status(200).json(categoryPerformance);
    } catch (error) {
        console.error("Error fetching category performance:", error);
        res.status(500).json({ msg: "Error fetching category performance", error: error.message });
    }
};

//Bid Success Rate Analytics
export const getBidSuccessRate = async (req, res) => {
    const { numberOfDays = 30 } = req.body;
    try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - numberOfDays);

        const bidAnalytics = await Bid.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: today }
                }
            },
            {
                $group: {
                    _id: {
                        city: "$car.city",
                        category: "$car.category.categoryName",
                        date: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        }
                    },
                    totalBids: { $sum: 1 },
                    acceptedBids: {
                        $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] }
                    },
                    rejectedBids: {
                        $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
                    },
                    cancelledBids: {
                        $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                    },
                    averageBidAmount: { $avg: "$bidAmount" },
                    totalBidAmount: { $sum: "$bidAmount" }
                }
            },
            {
                $project: {
                    totalBids: 1,
                    acceptedBids: 1,
                    rejectedBids: 1,
                    cancelledBids: 1,
                    averageBidAmount: 1,
                    totalBidAmount: 1,
                    successRate: {
                        $multiply: [
                            { $divide: ["$acceptedBids", "$totalBids"] },
                            100
                        ]
                    }
                }
            },
            {
                $sort: {
                    "_id.date": 1,
                    "successRate": -1
                }
            }
        ]);
        res.status(200).json(bidAnalytics);
    } catch (error) {
        console.error("Error fetching bid success rate:", error);
        res.status(500).json({ msg: "Error fetching bid success rate", error: error.message });
    }
};

//Peak Hours Analysis
export const getPeakHoursAnalysis = async (req, res) => {
    const { numberOfDays = 30 } = req.body;
    try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - numberOfDays);

        const peakHours = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: today },
                    status: { $in: ['confirmed', 'completed'] }
                }
            },
            {
                $group: {
                    _id: {
                        hour: { $hour: "$createdAt" },
                        dayOfWeek: { $dayOfWeek: "$createdAt" },
                        date: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        }
                    },
                    bookingCount: { $sum: 1 },
                    totalRevenue: { $sum: "$totalFare" },
                    localBookings: {
                        $sum: { $cond: [{ $eq: ["$rentalType", "local"] }, 1, 0] }
                    },
                    outstationBookings: {
                        $sum: { $cond: [{ $eq: ["$rentalType", "outstation"] }, 1, 0] }
                    },
                    averageFare: { $avg: "$totalFare" }
                }
            },
            {
                $sort: {
                    "_id.date": 1,
                    "_id.hour": 1,
                    "bookingCount": -1
                }
            }
        ]);
        console.log(peakHours);
        res.status(200).json(peakHours);
    } catch (error) {
        console.error("Error fetching peak hours analysis:", error);
        res.status(500).json({ msg: "Error fetching peak hours analysis", error: error.message });
    }
};