import mongoose from "mongoose";
import { Bid } from "../models/bid.model.js";
import { Car } from "../models/car.model.js";
import { sendMessageToSQS } from "../services/sqsProducer.service.js";

/**
 * @function calculateEstimate
 * @description Calculate the estimate for a bid based on rental type and car details.
 * @param {*} req
 * @param {*} res
 */
export const calculateEstimate = async (req, res) => {
  try {
    const { carId, bidData } = req.body;
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ msg: "Car not found" });
    }

    const rentalType = bidData.rentalType;
    const startDate = new Date(bidData.startDate);
    const endDate = new Date(bidData.endDate);
    const timeDiff = endDate - startDate;

    let basePrice = 0;
    let minBid = 0;
    let maxBid = 0;

    if (rentalType === "local") {
      if (!car.isAvailableForLocal) {
        return res
          .status(400)
          .json({ msg: "Car unavailable for local rental" });
      }

      const hours = Math.ceil(timeDiff / (1000 * 60 * 60));
      const localOptions = car.rentalOptions.local;

      basePrice = localOptions.pricePerHour * hours;
      minBid = basePrice;
      maxBid = basePrice * 1.5;
    } else if (rentalType === "outstation") {
      if (!car.isAvailableForOutstation) {
        return res
          .status(400)
          .json({ msg: "Car unavailable for outstation rental" });
      }

      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
      const outstationOptions = car.rentalOptions.outstation;
      console.log(outstationOptions, days);
      // basePrice = Math.max(
      //   outstationOptions.pricePerDay * days,
      //   outstationOptions.minimumKmChargeable * outstationOptions.pricePerKm
      // );
      basePrice =
        outstationOptions.pricePerDay * days,
        minBid = basePrice;
      maxBid = basePrice * 1.6;
    }

    res.status(200).json({
      basePrice,
      minBid,
      maxBid,
      duration: rentalType === "local" ? "hours" : "days",
      rentalLimits:
        rentalType === "local"
          ? car.rentalOptions.local
          : car.rentalOptions.outstation,
    });
  } catch (error) {
    console.error("Bid Controller :: Error calculating estimate", error);
    res.status(500).json({ msg: "Server Error", details: error.message });
  }
};

/**
 * @function submitBid
 * @description Submit a new bid for a car.
 * @param {*} req
 * @param {*} res
 */
export const submitBid = async (req, res) => {
  try {
    const { carId, bidData, userData } = req.body;
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ msg: "Car not found" });
    }

    let bidBaseFare = 0;
    if (bidData.rentalType === "local") {
      bidBaseFare = car.rentalOptions.local.pricePerHour;
    } else if (bidData.rentalType === "outstation") {
      bidBaseFare = car.rentalOptions.outstation.pricePerDay;
    } else {
      return res.status(400).json({ msg: "Invalid rental type" });
    }

    const bid = new Bid({
      fromTimestamp: bidData.startDate,
      toTimestamp: bidData.endDate,
      status: "pending",
      bidAmount: bidData.bidAmount,
      rentalType: bidData.rentalType,
      bidBaseFare, // Set the calculated bidBaseFare
      user: {
        userId: userData._id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
      },
      car: {
        carId: car._id,
        carName: car.carName,
        carType: car.carType,
        city: car.city,
        createdAt: car.createdAt,
        isAvailableForLocal: car.isAvailableForLocal,
        isAvailableForOutstation: car.isAvailableForOutstation,
        category: {
          categoryId: car.category._id,
          categoryName: car.category.categoryName,
        },
        owner: {
          userId: car.owner._id,
          username: car.owner.username,
          email: car.owner.email,
        },
        rentalOptions: car.rentalOptions,
      },
    });

    // Push this data to AWS SQS queue
    sendMessageToSQS(bid);
    console.log("Message sent to SQS");

    res.status(201).json({ msg: "Bid submitted successfully", bid });
  } catch (error) {
    console.error("Bid Controller :: Error submitting bid", error);
    res.status(500).json({ msg: "Server Error", details: error.message });
  }
};

/**
 * @function checkDateAvailability
 * @description Check if a car is available for the given dates.
 * @param {*} req
 * @param {*} res
 */
export const checkDateAvailability = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.query;
    const overlappingBids = await Bid.find({
      "car._id": carId,
      $or: [
        { fromTimestamp: { $lte: endDate }, toTimestamp: { $gte: startDate } },
      ],
    });

    const overlapping = overlappingBids.some((bid) => {
      if (bid.status === "rejected") return false;
      const bidStart = new Date(bid.fromTimestamp);
      const bidEnd = new Date(bid.toTimestamp);
      return startDate <= bidEnd && endDate >= bidStart;
    });

    res.status(200).json({ isAvailable: !overlapping });
  } catch (error) {
    console.error("Bid Controller :: Error checking date availability", error);
    res.status(500).json({ msg: "Server Error", details: error.message });
  }
};

/**
 * @function getBidsByUser
 * @description Get all bids submitted by a user.
 * @param {*} req
 * @param {*} res
 */
export const getBidsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const bids = await Bid.find({ "user.userId": userId })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json(bids);
  } catch (error) {
    console.error("Bid Controller :: Error fetching bids by user", error);
    res.status(500).json({ msg: "Server Error", details: error.message });
  }
};

/**
 * @function getBidsByCar
 * @description Get all bids for a specific car.
 * @param {*} req
 * @param {*} res
 */
export const getBidsByCar = async (req, res) => {
  try {
    const { carId } = req.params;
    const bids = await Bid.find({ "car._id": carId });
    res.status(200).json(bids);
  } catch (error) {
    console.error("Bid Controller :: Error fetching bids by car", error);
    res.status(500).json({ msg: "Server Error", details: error.message });
  }
};

/**
 * @function updateBidStatus
 * @description Update the status of a bid.
 * @param {*} req
 * @param {*} res
 */
export const updateBidStatus = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { status } = req.body;

    const bid = await Bid.findByIdAndUpdate(bidId, { status }, { new: true });
    if (!bid) {
      return res.status(404).json({ msg: "Bid not found" });
    }

    res.status(200).json({ msg: "Bid status updated successfully", bid });
  } catch (error) {
    console.error("Bid Controller :: Error updating bid status", error);
    res.status(500).json({ msg: "Server Error", details: error.message });
  }
};

/**
 * @function getBidById
 * @description Get a bid by its ID.
 * @param {*} req
 * @param {*} res
 */
export const getBidById = async (req, res) => {
  try {
    const { bidId } = req.params;
    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({ msg: "Bid not found" });
    }

    res.status(200).json(bid);
  } catch (error) {
    console.error("Bid Controller :: Error fetching bid by ID", error);
    res.status(500).json({ msg: "Server Error", details: error.message });
  }
};

/**
 * @function getBidsForOwner
 * @description Get all bids for a specific owner.
 * @param {*} req
 * @param {*} res
 */
// export const getBidsForOwner = async (req, res) => {
//     try {
//         const { ownerId } = req.params;
//         const { page = 1, limit = 10, bidStatus } = req.query;

//         // Build the query
//         const query = { "car.owner.userId": new mongoose.Types.ObjectId(ownerId) };

//         if (bidStatus && bidStatus !== 'all') {
//             query.status = bidStatus;
//         }

//         // Fetch total count and paginated bids
//         const totalItems = await Bid.countDocuments(query);
//         const bids = await Bid.find(query)
//             .skip((page - 1) * limit)
//             .limit(parseInt(limit));
//         res.status(200).json({ bids, totalItems });
//     } catch (error) {
//         console.error("Bid Controller :: Error fetching bids for owner", error);
//         res.status(500).json({ msg: "Server Error" });
//     }
// };

export const getBidsForOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { page = 1, limit = 10, bidStatus } = req.query;

    // Parse limit and page as numbers
    const parsedLimit = parseInt(limit, 10) || 10;
    const parsedPage = parseInt(page, 10) || 1;

    const query = { "car.owner.userId": new mongoose.Types.ObjectId(ownerId) };

    if (bidStatus && bidStatus !== "all") {
      const allowedStatuses = ["pending", "accepted", "rejected"];
      if (!allowedStatuses.includes(bidStatus)) {
        return res.status(400).json({ msg: "Invalid bid status" });
      }
      query.status = bidStatus;
    }
    const totalItems = await Bid.countDocuments(query);
    const bids = await Bid.find(query)
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.status(200).json({ bids, totalItems });
  } catch (error) {
    console.error("Bid Controller :: Error fetching bids for owner", error);
    res.status(500).json({ msg: "Server Error", details: error.message });
  }
};
