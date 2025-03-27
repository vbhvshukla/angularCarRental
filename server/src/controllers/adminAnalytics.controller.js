import { User } from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";
import { Bid } from "../models/bid.model.js";
import { Car } from "../models/car.model.js";

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
                        status:{
                            $in:['confirmed','completed']
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
                    status:{
                        $in:['confirmed','completed']
                    }
                }
            },
            {
                $project: {
                    rentalType: 1,
                    totalRevenue: 1,
                    createdAt: 1,
                    totalFare:1
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
                    status:{
                        $in:['confirmed','completed']
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
                $match:{
                    status:{
                        $in:['confirmed','completed']
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
                $project:{
                    category:1
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
};