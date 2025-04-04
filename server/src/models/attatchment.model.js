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
    },
    {
        timestamps: true
    }
)

export const Attachment = model("Attachment", attachmentSchema);
export { attachmentSchema }