import mongoose from "mongoose";

/** Car Types */
const carTypes = ["automatic", "manual"];

/** Featured Content */
const featured = ["Petrol", "Turbo", "2L", "1L", "1.5L", "Diesel", "Electric", "2 Seater", "4 Seater", "5 Seater", "7 Seater"];

/** Embedded Rating's Schema */
const ratingSchema = new mongoose.Schema({
    avgRating: {
        type: Number,
        required: true,
        default: 0
    },
    ratingCount: {
        type: Number,
        required: true,
        default: 0
    }
}, { _id: false })

/** Embedded Owner's Schema */
const ownerSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
}, {
    _id: false
})

/** Embedded Rental Schema */
const rentalSchema = new mongoose.Schema(
    {
        local: {
            extraHourlyRate: {
                type: Number,
                default: 0
            },
            extraKmRate: {
                type: Number,
                default: 0
            },
            maxKmPerHour: {
                type: Number,
                default: 0
            },
            pricePerHour: {
                type: Number,
                default: 0
            }
        },
        outstation: {
            pricePerDay: {
                type: Number,
                default: 0
            },
            pricePerKm: {
                type: Number,
                default: 0
            },
            minimumKmChargeable: {
                type: Number,
                default: 0
            },
            maxKmLimitPerDay: {
                type: Number,
                default: 0
            },
            extraKmRate: {
                type: Number,
                default: 0
            },
            extraHourRate: {
                type: Number,
                default: 0
            },
            extraDayRate: {
                type: Number,
                default: 0
            }
        }
    },

)

/** Embedded Category Schema */
const categorySchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    categoryName: {
        type: String,
        required: true
    },
})

/** Car's Schema */
const carSchema = new mongoose.Schema(
    {
        carName: {
            type: String,
            required: true
        },
        carType: {
            type: String,
            enum: carTypes,
            required: true
        },
        featured: featured,
        city: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        images: [
            {
                type: String,
                required: true
            }
        ],
        isAvailableForLocal: {
            type: Boolean,
            required: true,
        },
        isAvailableForOutstation: {
            type: Boolean,
            required: true
        },
        rating: ratingSchema,
        owner: ownerSchema,
        rentalOptions: rentalSchema,
        category: categorySchema,
        isDeleted:{
            type:Boolean,
            default:false
        }
    },
    {
        timestamps: true
    }
)

export const Car = mongoose.model("Car", carSchema)