import mongoose from "mongoose";
import jwt from "jsonwebtoken";

/** User Roles */
const userRoles = ['customer', 'admin', 'owner'];


/**
 * User Schema
 * @description Mongoose User Schema
 * Fields :
 *      username
 *      email
 *      password
 *      role
 *      rating
 *      isApproved
 *      
 * @type {*}
 */


const ratingSchema = new mongoose.Schema(
    {
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
    }, {
    _id: false
}
)

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        role: {
            type: String,
            required: true,
            enum: userRoles,
            default: 'customer'
        },
        rating: ratingSchema,
        isApproved: {
            type: Boolean,
            required: true,
            default: false
        },
        verificationFile: {
            type: String,
            default:'No Verification File Found!'
        }
    },
    {
        timestamps: true
    }
)

userSchema.methods.generateTokens = function () {
    const payload = {
        id: this._id,
        role: this.role
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2d' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, { expiresIn: '7d' });
    return { accessToken, refreshToken }
}

export const User = mongoose.model("User", userSchema);
