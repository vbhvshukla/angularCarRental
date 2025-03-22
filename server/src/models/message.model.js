import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
        index:true
    },
    message: {
        type: String,
        default: ""
    },
    attachment: {
        type: String,
        default: null
    },
    fromUser: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        username: { type: String, required: true },
        email: { type: String, required: true }
    },
    toUser: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        username: { type: String, required: true },
        email: { type: String, required: true }
    }
}, {
    timestamps: true
});

const Messages = mongoose.model("Messages", messageSchema);

export default Messages;