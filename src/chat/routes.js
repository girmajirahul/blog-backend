import { Router } from "express";
import { protect } from "../services/auth.middleware.js";
import {
  createConversation,
  getChatUsers,
  getConversations,
  getMessages,
  markConversationRead,
} from "./controllers/chat.controller.js";

const router = Router();
router.use(protect);
router.get("/users", getChatUsers);
router.get("/conversations", getConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:conversationId/messages", getMessages);
router.patch("/conversations/:conversationId/read", markConversationRead);

export default router;
