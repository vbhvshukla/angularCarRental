import { Schema, model } from "mongoose";

const attachmentSchema = new Schema(
    {
        url: {
            type: String,
            required: ['true', "Url is requuired!"]
        },
        type: {
            type: String,
            required: ['true', 'Attachment type is requried']
        },
        refId: {
            type: String,
            required: ['true', 'Ref Id is required']
        },
        fromUser: {
            userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
            username: { type: String, required: true },
            email: { type: String, required: true }
        },
        toUser: {
            userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
            username: { type: String, required: true },
            email: { type: String, required: true }
        }
    },
    {
        timestamps: true
    }
)

export const Attachment = model("Attachment", attachmentSchema);
export { attachmentSchema }