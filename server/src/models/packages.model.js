import mongoose, { Schema, model } from 'mongoose';

const routeSchema = new Schema({
    from: {
        type: String,
        required: [true, 'Starting location is required!']
    },
    to: {
        type: String,
        required: [true, 'Destination is required!']
    },
    distance: {
        type: Number,
        required: [true, 'Distance is required!']
    },
    duration: {
        type: String,
        required: [true, 'Duration is required!']
    },
    stayDuration: {
        type: String,
        required: [true, 'Stay Duration is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    }
}, { _id: false });

const ownerSchema = Schema({
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

const categorySchema = Schema({
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
}, { _id: false })

const carOptionSchema = new Schema({
    carId: {
        type: Schema.Types.ObjectId,
        ref: 'Car',
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
    price: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    
    category: categorySchema,

}, { _id: false });

const packageSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Package name is required!']
        },
        packagePrice: {
            type: Number,
            required: [true, 'Package price is required!']
        },
        images: [
            {
                type: String,
                required: true
            }
        ],
        from: {
            type: String,
            required: [true, 'From city is required!']
        },
        to: {
            type: String,
            required: [true, 'To city is required!']
        },
        routes: [routeSchema],
        cars: [carOptionSchema],
        driverIncluded: {
            type: Boolean,
            default: false
        },
        description: {
            type: String,
            required: [true, 'Package description is required!']
        },
        isActive: {
            type: Boolean,
            default: true
        },
        owner: ownerSchema,
    },
    {
        timestamps: true
    }
);

export const Package = model('Package', packageSchema);