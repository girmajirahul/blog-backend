import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { assertConversationParticipant, sendDirectMessage } from "../services/chat.service.js";

const userRoom = (userId) => `user:${userId}`;
const conversationRoom = (conversationId) => `conversation:${conversationId}`;
const onlineSocketCounts = new Map();

function emitPresence(io, userId, isOnline) {
  io.emit("presence:update", { userId, isOnline });
}

export function initializeChatSocket(io) {
  io.on("connection", (socket) => {
    const currentUserId = socket.user.id;
    socket.join(userRoom(currentUserId));

    const currentCount = onlineSocketCounts.get(currentUserId) || 0;
    onlineSocketCounts.set(currentUserId, currentCount + 1);
    if (currentCount === 0) emitPresence(io, currentUserId, true);

    socket.on("conversation:join", async (payload = {}) => {
      try {
        const conversationId = payload.conversationId;
        if (!mongoose.isValidObjectId(conversationId)) {
          return socket.emit("chat:error", { message: "Invalid conversation ID." });
        }
        const conversation = await assertConversationParticipant(conversationId, currentUserId);
        if (!conversation) {
          return socket.emit("chat:error", { message: "Conversation not found." });
        }
        socket.join(conversationRoom(conversationId));
        socket.emit("conversation:joined", { conversationId });
      } catch {
        socket.emit("chat:error", { message: "Unable to join conversation." });
      }
    });

    socket.on("conversation:leave", (payload = {}) => {
      if (mongoose.isValidObjectId(payload.conversationId)) {
        socket.leave(conversationRoom(payload.conversationId));
      }
    });

    socket.on("message:send", async (payload = {}) => {
      try {
        const result = await sendDirectMessage({
          senderId: currentUserId,
          receiverId: payload.receiverId,
          conversationId: payload.conversationId,
          text: payload.text,
        });

        const eventPayload = {
          conversationId: String(result.conversationId),
          message: result.message,
        };

        // User rooms deliver to every open tab/device for both participants.
        io.to(userRoom(currentUserId)).emit("message:new", eventPayload);
        io.to(userRoom(String(result.message.receiver._id))).emit("message:new", eventPayload);
      } catch (error) {
        socket.emit("chat:error", { message: error.message || "Message could not be sent." });
      }
    });

    socket.on("typing:start", async (payload = {}) => {
      try {
        const conversation = await assertConversationParticipant(payload.conversationId, currentUserId);
        if (!conversation) return;
        const otherUserId = conversation.participants.find(
          (id) => String(id) !== currentUserId
        );
        if (otherUserId) {
          io.to(userRoom(String(otherUserId))).emit("typing:update", {
            conversationId: String(conversation._id),
            userId: currentUserId,
            isTyping: true,
          });
        }
      } catch {
        // Ignore malformed typing events; they must not interrupt the socket.
      }
    });

    socket.on("typing:stop", async (payload = {}) => {
      try {
        const conversation = await assertConversationParticipant(payload.conversationId, currentUserId);
        if (!conversation) return;
        const otherUserId = conversation.participants.find(
          (id) => String(id) !== currentUserId
        );
        if (otherUserId) {
          io.to(userRoom(String(otherUserId))).emit("typing:update", {
            conversationId: String(conversation._id),
            userId: currentUserId,
            isTyping: false,
          });
        }
      } catch {
        // Ignore malformed typing events.
      }
    });

    socket.on("messages:read", async (payload = {}) => {
      try {
        const conversation = await assertConversationParticipant(payload.conversationId, currentUserId);
        if (!conversation) return;

        const readAt = new Date();
        await Message.updateMany(
          { conversation: conversation._id, receiver: currentUserId, readAt: null },
          { $set: { readAt } }
        );

        const otherUserId = conversation.participants.find(
          (id) => String(id) !== currentUserId
        );
        if (otherUserId) {
          io.to(userRoom(String(otherUserId))).emit("messages:read", {
            conversationId: String(conversation._id),
            readerId: currentUserId,
            readAt,
          });
        }
      } catch {
        socket.emit("chat:error", { message: "Unable to mark messages as read." });
      }
    });

    socket.on("disconnect", () => {
      const count = onlineSocketCounts.get(currentUserId) || 1;
      if (count <= 1) {
        onlineSocketCounts.delete(currentUserId);
        emitPresence(io, currentUserId, false);
      } else {
        onlineSocketCounts.set(currentUserId, count - 1);
      }
    });
  });
}
