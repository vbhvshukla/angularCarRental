import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
    fromTimestamp: {
        type: Date,
        required: true
    },
    toTimestamp: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected','cancelled'],
        default: 'pending'
    },
    bidAmount: {
        type: Number,
        required: true
    },
    rentalType: {
        type: String,
        enum: ['local', 'outstation'],
        required: true
    },
    bidBaseFare: {
        type: Number,
        required: true
    },
    user: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User',
            required: true
        },
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'customer'],
            required: true
        }
    },
    car: {
        carId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Car',
            required: true
        },
        carName: {
            type: String,
            required: true
        },
        carType: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            required: true
        },
        isAvailableForLocal: {
            type: Boolean,
            required: true
        },
        isAvailableForOutstation: {
            type: Boolean,
            required: true
        },
        category: {
            categoryId: {
                type: String,
                required: true
            },
            categoryName: {
                type: String,
                required: true
            }
        },
        owner: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref:'User',
                required: true
            },
            username: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
        },
        rentalOptions: {
            local: {
                pricePerHour: { type: Number },
                maxKmPerHour: { type: Number },
                extraHourRate: { type: Number },
                extraKmRate: { type: Number }
            },
            outstation: {
                pricePerDay: { type: Number },
                pricePerKm: { type: Number },
                minimumKmChargeable: { type: Number },
                maxKmLimitPerDay: { type: Number },
                extraDayRate: { type: Number },
                extraHourlyRate: { type: Number },
                extraKmRate: { type: Number }
            }
        }
    }
}, {
    timestamps: true
});
bidSchema.index({ "car.owner.userId": 1, createdAt: 1 });
export const Bid = mongoose.model("Bid", bidSchema);
export {bidSchema}
