import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
        unique: true,
        index:true
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
        required: true
    },
    lastMessage: {
        type: String,
        default: ""
    },
    lastTimestamp: {
        type: Date,
        default: Date.now
    },
    owner: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        username: { type: String, required: true },
        email: { type: String, required: true }
    },
    user: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        username: { type: String, required: true },
        email: { type: String, required: true }
    }
}, {
    timestamps: true
});

const Conversations = mongoose.model("Conversations", conversationSchema);

export default Conversations;