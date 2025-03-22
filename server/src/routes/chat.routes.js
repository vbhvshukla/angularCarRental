import { Router } from "express";
import {
    createChat,
    getUserConversations,
    getOwnerConversations,
    getMessages,
    sendMessage,
    getChatParticipants,
} from "../controllers/chat.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", authenticate, createChat);

router.get("/user/:userId", authenticate, getUserConversations);

router.get("/owner/:ownerId", authenticate, getOwnerConversations);

router.get("/messages/:chatId", authenticate, getMessages);

router.post("/messages/send", authenticate, sendMessage);

router.get("/participants/:chatId", authenticate, getChatParticipants);

export default router;