import mongoose from "mongoose";

const carAvailabilitySchema = new mongoose.Schema({
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
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
}, {
    timestamps: true
});

const CarAvailability = mongoose.model("CarAvailability", carAvailabilitySchema);

export default CarAvailability;