import mongoose from "mongoose";
import { Bid } from "../models/bid.model.js";
import { Car } from "../models/car.model.js";
import { Booking } from "../models/booking.model.js"

// export const getTotals = async (req, res) => {
//     try {

//         const ownerId = req.body.ownerId; // Ensure ownerId is an ObjectId
//         // console.log(ownerId);
//         const totalBookings = await Booking.countDocuments({ "bid.car.owner.userId": ownerId });
//         const totalCars = await Car.countDocuments({ "owner._id": ownerId })
//         const totalBids = await Bid.countDocuments({ "car.owner.userId": ownerId });

//         const totalRevenueResult = await Booking.aggregate(
//             [
//                 {
//                     //Match the document with the given id
//                     $match: {
//                         'bid.car.owner.userId': ownerId
//                     }
//                 }, 
//                 {
//                     //Group the documents as a single document and sum up the revenue
//                     $group: {
//                         _id: null, //treat all documents as a single group
//                         totalRevenue:
//                         {
//                             $sum: '$totalFare'
//                         }
//                     }
//                 }
//             ]
//         )
//         console.log(totalRevenueResult);

//         const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

//         res.status(200).json({ totalBookings, totalBids, totalRevenue, totalCars });
//     } catch (error) {
//         console.error("Error in getTotals:", error);
//         res.status(400).json({ msg: "Error getting totals", error });
//     }
// }

export const getTotals = async (req, res) => {
    try {
        const ownerId = new mongoose.Types.ObjectId(req.body.ownerId); // Ensure ownerId is an ObjectId
        console.log("Get Totals Owner Id :", ownerId);
        const totalBookings = await Booking.countDocuments({ "bid.car.owner.userId": ownerId });
        const totalBids = await Bid.countDocuments({ "car.owner.userId": ownerId });
        const totalRevenueResult = await Booking.aggregate(
            [
                {
                    //Match the document with the given id
                    $match: {
                        'bid.car.owner.userId': ownerId
                    }
                }, {
                    //Only pass totalFare instead of whole document.
                    $project: {
                        totalFare: 1
                    },
                }, {
                    //Group the documents as a single document and sum up the revenue
                    $group: {
                        _id: null, //treat all documents as a single group
                        totalRevenue:
                        {
                            $sum: '$totalFare'
                        }
                    }
                }
            ]
        )
        const totalCars = await Car.countDocuments({ "owner._id": ownerId })

        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;
        res.status(200).json({ totalBookings, totalBids, totalRevenue, totalCars });
    } catch (error) {
        console.error("Error in getTotals:", error);
        res.status(400).json({ msg: "Error getting totals", error });
    }
}

export const totalBookingsPerCar = async (req, res) => {
    const { ownerId, numberOfDays = 7 } = req.body;
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    //Get the today's date.
    const today = new Date();
    //Get the startDate and subtract the today
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - numberOfDays);

    try {
        const bookingData = await Booking.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: today
                    },
                    'bid.car.owner.userId': ownerObjectId
                }
            },
            {
                $group: {
                    _id: "$bid.car.carId",
                    carName: {
                        $first: "$bid.car.carName" //get the first document of the collection 
                    },
                    totalBookings: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    totalBookings: -1
                }
            }
        ])
        res.status(200).json(bookingData);
    } catch (error) {
        console.error("Error fetching bookings per car:", error);
        res.status(500).json({ msg: "Error fetching bookings per car", error });
    }
}

export const rentalDurationPerCar = async (req, res) => {
    const { ownerId, numberOfDays = 7 } = req.body;
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    //Get the today's date.
    const today = new Date();
    //Get the startDate and subtract the today
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - numberOfDays);
    try {
        const rentalDurationData = await Booking.aggregate(
            [
                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: today
                        },
                        'bid.car.owner.userId': ownerObjectId
                    },
                },
                {
                    $addFields: {
                        durationInMs: { $subtract: ["$toTimestamp", "$fromTimestamp"] }
                    }
                }
                ,
                {
                    $group: {
                        _id: "$bid.car.carId",
                        carName: {
                            $first: "$bid.car.carName"
                        },
                        totalLocalDurationInHours: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: ["$rentalType", "local"]
                                    },
                                    {
                                        $divide: [
                                            "$durationInMs", 1000 * 60 * 60
                                        ]
                                    },
                                    0 //Cond takes 3 arguments if , then , else
                                ]
                            }
                        },
                        totalOutstationDurationInDays: {
                            $sum: {
                                $cond:
                                    [
                                        { $eq: ["rentalType", "outstation"] },
                                        { $divide: ['$durationInMs', 1000 * 60 * 60 * 24] },
                                        0 //If it's not outstation give it 0
                                    ]
                            }
                        }
                    }
                },
                {
                    // Sort by totalLocalDurationInHours in descending order
                    $sort: { totalLocalDurationInHours: -1 }
                }
            ]
        )
        res.status(200).json(rentalDurationData);
    } catch (error) {
        console.error("Error calculating rental duration per car:", error);
        res.status(500).json({ msg: "Error calculating rental duration per car", error: error.message });
    }
}

export const revenueOverTime = async (req, res) => {
    const { ownerId, numberOfDays = 7 } = req.body;
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    //Get the today's date.
    const today = new Date();
    //Get the startDate and subtract the today
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - numberOfDays);
    try {
        const revenueData = await Booking.aggregate(
            [
                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: today
                        },
                        'bid.car.owner.userId': ownerObjectId
                    },
                },
                {
                    $group: {
                        _id: {
                            carId: "$bid.car.carId",
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        carName: {
                            $first: "$bid.car.carName",

                        },
                        totalLocalRevenue: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: ["$rentalType", "local"]
                                    },
                                    "$totalFare",
                                    0 //Cond takes 3 arguments if , then , else
                                ]
                            }
                        },
                        totalOutstationRevenue: {
                            $sum: {
                                $cond:
                                    [
                                        { $eq: ["rentalType", "outstation"] },
                                        "$totalFare",
                                        0 //If it's not outstation give it 0
                                    ]
                            }
                        }
                    }
                },
                {
                    // Sort by totalLocalDurationInHours in descending order
                    $sort: { _id: -1 }
                }
            ]
        )
        const formattedData = revenueData.map((data) => ({
            month: `${data._id.year}-${String(data._id.month).padStart(2, '0')}`, // Format as YYYY-MM
            carName: data.carName,
            date: data._id.date,
            totalLocalRevenue: data.totalLocalRevenue,
            totalOutstationRevenue: data.totalOutstationRevenue
        }));
        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error calculating rental duration per car:", error);
        res.status(500).json({ msg: "Error calculating rental duration per car", error: error.message });
    }
}

export const bidAmountPerCar = async (req, res) => {
    const { ownerId, numberOfDays = 7 } = req.body;
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    // Get today's date
    const today = new Date();

    // Calculate the start date based on the number of days
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - numberOfDays);

    try {
        const bidAmountData = await Bid.aggregate([
            {
                $match: {
                    "car.owner.userId": ownerObjectId,
                    createdAt: {
                        $gte: startDate,
                        $lte: today
                    }
                }
            },
            {
                $group: {
                    _id: "$car.carId", // Group by carId
                    carName: { $first: "$car.carName" }, // Use $first to get the carName
                    bidAmount: { $sum: "$bidAmount" } // Sum up the bid amounts
                }
            },
            {
                $sort: { bidAmount: -1 } // Sort by bidAmount in descending order
            }
        ]);

        res.status(200).json(bidAmountData);
    } catch (error) {
        console.error("Error fetching bid amount per car:", error);
        res.status(500).json({ msg: "Error fetching bid amount per car", error: error.message });
    }
};