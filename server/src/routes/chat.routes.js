import { Router } from "express";
import {
    createChat,
    getUserConversations,
    getOwnerConversations,
    getMessages,
    sendMessage,
    getChatParticipants,
    getAllMedia,
    searchConversations,
    searchUserConversations
} from "../controllers/chat.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", authenticate, createChat);

router.get("/user/:userId", authenticate, getUserConversations);

router.get("/owner/:ownerId", authenticate, getOwnerConversations);

router.get("/owner/search/:ownerId", searchConversations);

router.get("/user/search/:userId", searchUserConversations);

router.get("/messages/:chatId", authenticate, getMessages);

router.post("/messages/send", authenticate, sendMessage);

router.get("/participants/:chatId", authenticate, getChatParticipants);

router.get("/attachments/:chatId", getAllMedia);

export default router;