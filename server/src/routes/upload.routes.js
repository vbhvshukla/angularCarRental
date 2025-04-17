import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { Attachment } from "../models/attatchment.model.js";
const router = express.Router();

/**
 * @route POST /upload
 * @description Upload a file to S3 and return the file URL
 */
router.post("/", upload.single("file"), (req, res) => {
    try {
        // The file URL is available in `req.file.location`
        const fileUrl = req.file.location;
        const { chatId, fromUser, toUser } = req.body;
        
        // Parse the JSON strings back into objects
        const parsedFromUser = JSON.parse(fromUser);
        const parsedToUser = JSON.parse(toUser);

        const newAttatchment = new Attachment({
            url: fileUrl,
            type: req.file.mimetype,
            refId: chatId,
            fromUser: {
                userId: parsedFromUser._id,
                username: parsedFromUser.username,
                email: parsedFromUser.email
            },
            toUser: {
                userId: parsedToUser._id,
                username: parsedToUser.username,
                email: parsedToUser.email
            }
        })

        console.log(newAttatchment);

        newAttatchment.save();

        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            fileUrl: fileUrl,
            newAttatchment
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({
            success: false,
            message: "Error uploading file",
            error: error.message,
        });
    }
});



export default router;