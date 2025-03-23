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
                    //Group the document by the userId
                    $group: {
                        _id: "$user.userId",
                        totalBids: {
                            $sum: 1
                        }
                    },
                },
                //Sort the collection and limit the collection the the top 3
                {
                    $sort: {
                        totalBids: -1
                    }
                },
                {
                    $limit: 3
                },
                {
                    $project: {
                        _id: 0,
                        userId: "$user._id",
                        username: "$user.username",
                        totalBids: 1
                    }
                }
            ]
        )
        res.status(200).json({
            totalUsers,
            totalBookings,
            totalBiddings,
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
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: today
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            city: "$city",
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
                    }
                }
            },
            {
                $group: {
                    _id: "$rentalType",
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    totalRevenue: {
                        $sum: "$totalFare"
                    }
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
                    }
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

export const topPerformingOwners = async(req,res)=>{
    try {
        const topOwners = await Booking.aggregate([
            {
                $group:{
                    _id:"$bid.car.owner.userId",
                    totalRevenue:{
                        $sum:"$totalFare"
                    },
                    totalBookings:{
                        $sum:1
                    }
                }
            },
            {
                $sort:{
                    totalRevenue:-1
                }
            },
            {
                $limit:5
            }
        ])
    } catch (error) {
        
    }
}