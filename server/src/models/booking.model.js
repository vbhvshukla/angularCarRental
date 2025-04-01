import mongoose from "mongoose";
import { bidSchema } from "./bid.model.js";

const bookingSchema = new mongoose.Schema(
    {
        baseFare: {
            type: Number,
            required: true
        },
        fromTimestamp: {
            type: Date,
            required: true
        },
        toTimestamp: {
            type: Date,
            required: true
        },
        bid: bidSchema,
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            default: 'pending'
        },
        rentalType: {
            type: String,
            enum: ['local', 'outstation'],
            required: true
        },
        extraKmCharges: {
            type: Number,
            default: 0
        },
        extraHourCharges: {
            type: Number,
            default: 0
        },
        extraDayCharges: {
            type: Number,
            default: 0
        },
        totalFare: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
)
bookingSchema.index({ "bid.car.owner.userId": 1, totalFare: 1, createdAt: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);
