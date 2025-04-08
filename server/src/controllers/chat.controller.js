import Conversations from "../models/conversation.model.js";
import Messages from "../models/message.model.js";
import { Attachment } from "../models/attatchment.model.js";
/**
 * @function createChat
 * @description Create a new chat between a user and an owner for a specific car.
 */
export const createChat = async (req, res) => {
    const { carId, user, owner } = req.body;
    if (!carId || !user || !owner) {
        return res.status(400).json({ error: "Missing required fields: carId, user, or owner." });
    }

    try {
        let chatId = null;
        if (user._id) {
            chatId = `${user._id}_${owner._id}_${carId}`;
        }
        else {
            chatId = `${user.userId}_${owner.userId}_${carId}`;
        }
        const existingChat = await Conversations.findOne({ chatId });
        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        const newConversation = new Conversations({
            chatId,
            carId,
            lastMessage: "",
            lastTimestamp: new Date(),
            owner: {
                userId: owner._id,
                username: owner.username,
                email: owner.email
            },
            user: {
                userId: user._id,
                username: user.username,
                email: user.email
            },
        });

        await newConversation.save();
        res.status(201).json(newConversation);
    } catch (error) {
        res.status(500).json({ error: "Failed to create chat.", details: error.message });
    }
};

/**
 * @function getUserConversations
 * @description Get all conversations for a specific user.
 */
export const getUserConversations = async (req, res) => {
    const { userId } = req.params;

    try {
        const conversations = await Conversations.find({ "user.userId": userId }).sort({ lastTimestamp: -1 });
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user conversations.", details: error.message });
    }
};

/**
 * @function getOwnerConversations
 * @description Get all conversations for a specific owner.
 */
export const getOwnerConversations = async (req, res) => {
    const { ownerId } = req.params;

    try {
        const conversations = await Conversations.find({ "owner.userId": ownerId }).sort({ lastTimestamp: -1 });
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch owner conversations.", details: error.message });
    }
};

/**
 * @function getMessages
 * @description Get all messages for a specific chatId.
 */
export const getMessages = async (req, res) => {
    const { chatId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const messages = await Messages.find({ chatId })
            .sort({ createdAt: 1 })
            .skip((page - 1) * limit)
            .limit(limit);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages.", details: error.message });
    }
};

/**
 * @function sendMessage
 * @description Send a message in a specific chat.
 */
export const sendMessage = async (req, res) => {
    const { chatId, fromUser, toUser, message, attachment } = req.body;

    console.log(`Chat id :: ${chatId} | From User : ${fromUser} | To User : ${toUser} | Message : ${message} | Attachment : ${attachment}`);

    if (!chatId || !fromUser || !toUser || !message) {
        return res.status(400).json({ error: "Missing required fields: chatId, fromUser, toUser, or message." });
    }

    console.log(attachment);
    try {
        const newMessage = new Messages({
            chatId,
            message,
            attachment: attachment || null,
            fromUser: {
                userId: fromUser._id,
                username: fromUser.username,
                email: fromUser.email
            },
            toUser: {
                userId: toUser._id,
                username: toUser.username,
                email: toUser.email
            },
        });
        await newMessage.save();

        const updatedConversation = await Conversations.findOneAndUpdate(
            { chatId },
            { lastMessage: message, lastTimestamp: new Date() },
            { new: true }
        );

        // Get the io instance we set in indexjs
        const io = req.app.get('io');
        //Emit the new message onto the chatId room.
        io.to(chatId).emit('newMessage', newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: "Failed to send message.", details: error.message });
    }
};


/**
 * Send Owner Message
 * @description Currently not in use
 * @async
 * @param {*} req 
 * @param {*} res 
 * @returns {unknown} 
 */
export const sendOwnerMessage = async (req, res) => {
    const { chatId, fromUser, toUser, message, attachment } = req.body;
    if (!chatId || !fromUser || !toUser || !message) {
        return res.status(400).json({ error: "Missing required fields: chatId, fromUser, toUser, or message." });
    }

    console.log(attachment);

    try {
        const newMessage = new Messages({
            chatId,
            message,
            attachment: attachment || null,
            fromUser: {
                userId: fromUser._id,
                username: fromUser.username,
                email: fromUser.email
            },
            toUser: {
                userId: toUser._id,
                username: toUser.username,
                email: toUser.email
            },
        });

        await newMessage.save();

        await Conversations.findOneAndUpdate(
            { chatId },
            { lastMessage: message, lastTimestamp: new Date() },
            { new: true }
        );

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: "Failed to send message.", details: error.message });
    }
};

/**
 * @function getChatParticipants
 * @description Get participants of a specific chat.
 */
export const getChatParticipants = async (req, res) => {
    const { chatId } = req.params;

    try {
        const conversation = await Conversations.findOne({ chatId });
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found." });
        }

        res.status(200).json({
            owner: conversation.owner,
            user: conversation.user,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch chat participants.", details: error.message });
    }
};



/**
 * Get All The Media Files related to a particular chat.
 * @function getChatParticipants
 * @async
 * @param {*} req 
 * @param {*} res 
 * @returns {*} 
 */
export const getAllMedia = async (req, res) => {
    const { chatId } = req.query;
    console.log(chatId);
    try {
        const data = await Attachment.aggregate(
            [
                {
                    $match: {
                        'refId': chatId
                    }
                },
                {
                    $project: {
                        url: 1
                    }
                }
            ]
        )
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch media files.", details: error })
    }
}