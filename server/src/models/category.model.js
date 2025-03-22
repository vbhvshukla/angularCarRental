import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const Category = mongoose.model('Category', categorySchema);