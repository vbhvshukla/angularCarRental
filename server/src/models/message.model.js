import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
        index: true
    },
    message: {
        type: String,
        default: ""
    },
    attachment: {
        attachmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attachment",
        },
        url: {
            type: String,
        }
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