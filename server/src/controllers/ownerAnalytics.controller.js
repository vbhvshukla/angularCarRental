import mongoose from "mongoose";
import { Bid } from "../models/bid.model.js";
import { Car } from "../models/car.model.js";
import { Booking } from "../models/booking.model.js"

export const getTotals = async (req, res) => {
    try {
        const ownerId = new mongoose.Types.ObjectId(req.body.ownerId);
        console.log("Get Totals Owner Id :", ownerId);
        const totalBookings = await Booking.countDocuments({ "bid.car.owner.userId": ownerId });
        const totalBids = await Bid.countDocuments({ "car.owner.userId": ownerId });
        const totalRevenueResult = await Booking.aggregate(
            [
                {
                    //match the document with the given id
                    $match: {
                        'bid.car.owner.userId': ownerId,
                        status:{
                            $in:['confirmed','completed']
                        }
                    }
                }, {
                    //only pass totalFare instead of whole document.
                    $project: {
                        totalFare: 1
                    },
                }, {
                    //group the documents as a single document and sum up the revenue
                    $group: {
                        _id: null,
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
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - numberOfDays);

    try {
        const bookingData = await Booking.aggregate([
            {
                //match by the date created and the usrId
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: today
                    },
                    'bid.car.owner.userId': ownerObjectId
                }
            },
            {
                $project: {
                    bid: 1
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
                    $project: {
                        bid: 1,
                        fromTimestamp: 1,
                        toTimestamp: 1,
                        rentalType: 1
                    }
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
                        //first is an accumulator
                        carName: {
                            $first: "$bid.car.carName"
                        },
                        totalLocalDurationInHours: {
                            $sum: {
                                $cond: [
                                    {
                                        //if rental type is local
                                        $eq: ["$rentalType", "local"]
                                    },
                                    {
                                        //convert it to hours divide the milliseconds
                                        $divide: [
                                            "$durationInMs", 1000 * 60 * 60
                                        ]
                                    },
                                    0
                                ]
                            }
                        },
                        totalOutstationDurationInDays: {
                            $sum: {
                                $cond: //takes 3 arguments -> if -> then -> else
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
                        'bid.car.owner.userId': ownerObjectId,
                        status:{
                            $in:['confirmed','completed']
                        }
                    },
                },
                {
                    $project: {
                        bid: 1,
                        rentalType: 1,
                        createdAt: 1,
                        totalFare: 1
                    }
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
            //format the month to 03-2023 something
            month: `${data._id.year}-${String(data._id.month).padStart(2, '0')}`,
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
                $project: {
                    car: 1,
                    bidAmount: 1
                }
            },
            {
                $group: {
                    _id: "$car.carId", // group by carId
                    carName: { $first: "$car.carName" }, // Use $first to get the carName
                    bidAmount: { $sum: "$bidAmount" } // sum up the bid amounts
                }
            },
            {
                $sort: { bidAmount: -1 } // sort by bidAmount in descending order
            }
        ]);

        res.status(200).json(bidAmountData);
    } catch (error) {
        console.error("Error fetching bid amount per car:", error);
        res.status(500).json({ msg: "Error fetching bid amount per car", error: error.message });
    }
};

export const revenueByCar = async (req, res) => {
    const { ownerId, numberOfDays = 7 } = req.body;
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - numberOfDays);

    try {
        const revenueData = await Booking.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: today
                    },
                    'bid.car.owner.userId': ownerObjectId,
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
                $group: {
                    _id: "$bid.car.carId",
                    carName: {
                        $first: '$bid.car.carName'
                    },
                    totalRevenue: {
                        $sum: 'totalFare'
                    }
                }
            },
            {
                $sort: {
                    totalRevenue: -1
                }
            }
        ])
        res.status(200).json(revenueData);
    } catch (error) {
        console.error("Error fetching revenue by car:", error);
        res.status(500).json({ msg: "Error fetching revenue by car", error: error.message });
    }
}

export const carAvailabilityInsights = async (req, res) => {
    const { ownerId, numberOfDays = 30 } = req.body;
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - numberOfDays);

    try {
        const availabilityData = await Booking.aggregate([
            {
                $match: {
                    createdAt:
                    {
                        $gte: startDate,
                        $lte: today
                    },
                    'bid.car.owner.userId': ownerObjectId
                }
            },
            {
                $project: {
                    bid: 1,
                    fromTimestamp: 1,
                    toTimestamp: 1
                }
            },
            {
                $addFields: {
                    durationInMs: {
                        $subtract:
                            [
                                '$toTimestamp',
                                '$fromTimestamp'
                            ]
                    }
                }
            },
            {
                $group: {
                    _id: '$bid.car.carId',
                    carName: {
                        $first: '$bid.car.carName'
                    },
                    totalRentalDurationInHours:
                    {
                        $sum: {
                            $divide: [
                                '$durationInMs', 1000 * 60 * 60
                            ]
                        }
                    }
                }
            }
        ])
        const totalHoursInPeriod = numberOfDays * 24;
        const formattedData = availabilityData.map(car => ({
            carName: car.carName,
            totalRentalDurationInHours: car.totalRentalDurationInHours,
            availabilityPercentage: (
                ((totalHoursInPeriod - car.totalRentalDurationInHours) / totalHoursInPeriod) *
                100
            ).toFixed(2)
        }));
        res.status(200).json(formattedData);

    } catch (error) {
        console.error("Error fetching car availability insights:", error);
        res.status(500).json({ msg: "Error fetching car availability insights", error: error.message });
    }

}

export const rentalTypeDistribution = async (req, res) => {
    const { ownerId, numberOfDays = 30 } = req.body;
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - numberOfDays);

    try {
        const rentalTypeData = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: today },
                    'bid.car.owner.userId': ownerObjectId
                }
            },
            {
                $project: {
                    rentalType: 1
                }
            },
            {
                $group: {
                    _id: "$rentalType",
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalBookings = rentalTypeData.reduce((sum, type) => sum + type.count, 0);
        const formattedData = rentalTypeData.map(type => {
            console.log(type)
            return {
                rentalType: type._id,
                count: type.count,
                percentage: ((type.count / totalBookings) * 100).toFixed(2)
            }
        });

        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching rental type distribution:", error);
        res.status(500).json({ msg: "Error fetching rental type distribution", error: error.message });
    }
};

export const categoryPerformance = async (req, res) => {
    const { ownerId, numberOfDays = 30 } = req.body;
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - numberOfDays);
    //get today's date and time
    // console.log(today);
    // console.log(startDate.setDate(today.getDate));
    // console.log(startDate.setDate(today.getDate() - numberOfDays));

    try {
        const categoryData = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: today },
                    'bid.car.owner.userId': ownerObjectId
                }
            },
            {
                $project: {
                    bid: 1,
                    totalFare: 1
                }
            },
            {
                $group: {
                    _id: "$bid.car.category.categoryName",
                    totalRevenue: { $sum: "$totalFare" },
                    totalBookings: { $sum: 1 }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            }
        ]);

        res.status(200).json(categoryData);
    } catch (error) {
        console.error("Error fetching category performance:", error);
        res.status(500).json({ msg: "Error fetching category performance", error: error.message });
    }
};

export const peakBookingHours = async (req, res) => {
    const { ownerId, numberOfDays = 30 } = req.body;
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - numberOfDays);

    try {
        const bookingHoursData = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: today },
                    'bid.car.owner.userId': ownerObjectId
                }
            },
            {
                $project: {
                    hour: { $hour: "$createdAt" }
                }
            },
            {
                $group: {
                    _id: "$hour",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const formattedData = bookingHoursData.map(hourData => ({
            hour: `${hourData._id}:00 - ${hourData._id + 1}:00`,
            bookings: hourData.count
        }));

        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching peak booking hours:", error);
        res.status(500).json({ msg: "Error fetching peak booking hours", error: error.message });
    }
};