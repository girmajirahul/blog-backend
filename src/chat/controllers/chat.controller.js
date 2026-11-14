import mongoose from "mongoose";
import User from "../../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import {
  assertConversationParticipant,
  findOrCreateDirectConversation,
} from "../services/chat.service.js";

// GET /api/chat/users?search=rahul
export async function getChatUsers(req, res) {
  try {
    const filter = { _id: { $ne: req.user.id } };
    const search = String(req.query.search || "").trim();
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("name avatar role")
      .sort({ name: 1 })
      .limit(30)
      .lean();

    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load users." });
  }
}

// GET /api/chat/conversations
export async function getConversations(req, res) {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate("participants", "name avatar role")
      .sort({ lastMessageAt: -1 })
      .lean();

    const result = conversations.map((conversation) => ({
      ...conversation,
      otherParticipant: conversation.participants.find(
        (participant) => String(participant._id) !== String(req.user.id)
      ) || null,
    }));

    return res.json({ success: true, conversations: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load conversations." });
  }
}

// POST /api/chat/conversations { receiverId }
export async function createConversation(req, res) {
  try {
    const { receiverId } = req.body;
    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ success: false, message: "A valid receiverId is required." });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const conversation = await findOrCreateDirectConversation(req.user.id, receiverId);
    await conversation.populate("participants", "name avatar role");
    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// GET /api/chat/conversations/:conversationId/messages?limit=30&before=<ISO date>
export async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const conversation = await assertConversationParticipant(conversationId, req.user.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 30;
    const filter = { conversation: conversationId };

    if (req.query.before) {
      const before = new Date(req.query.before);
      if (Number.isNaN(before.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid before date." });
      }
      filter.createdAt = { $lt: before };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .lean();

    return res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load messages." });
  }
}

// PATCH /api/chat/conversations/:conversationId/read
export async function markConversationRead(req, res) {
  try {
    const { conversationId } = req.params;
    const conversation = await assertConversationParticipant(conversationId, req.user.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    const readAt = new Date();
    const result = await Message.updateMany(
      { conversation: conversationId, receiver: req.user.id, readAt: null },
      { $set: { readAt } }
    );

    return res.json({ success: true, readAt, modifiedCount: result.modifiedCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to mark messages as read." });
  }
}
