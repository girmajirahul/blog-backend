import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../../models/user.model.js";

const makeParticipantKey = (firstId, secondId) =>
  [String(firstId), String(secondId)].sort().join(":");

export async function findOrCreateDirectConversation(firstId, secondId) {
  if (!mongoose.isValidObjectId(firstId) || !mongoose.isValidObjectId(secondId)) {
    throw new Error("A valid receiver is required.");
  }

  if (String(firstId) === String(secondId)) {
    throw new Error("You cannot start a conversation with yourself.");
  }

  const participantKey = makeParticipantKey(firstId, secondId);

  try {
    return await Conversation.findOneAndUpdate(
      { participantKey },
      {
        $setOnInsert: {
          participants: [firstId, secondId],
          participantKey,
          lastMessageAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    // Two users may create the same conversation at nearly the same time.
    if (error.code === 11000) {
      const existing = await Conversation.findOne({ participantKey });
      if (existing) return existing;
    }
    throw error;
  }
}

export async function sendDirectMessage({ senderId, receiverId, conversationId, text }) {
  const cleanText = typeof text === "string" ? text.trim() : "";
  if (!cleanText) throw new Error("Message cannot be empty.");
  if (cleanText.length > 5000) throw new Error("Message cannot exceed 5000 characters.");

  let conversation;
  if (conversationId) {
    if (!mongoose.isValidObjectId(conversationId)) {
      throw new Error("Invalid conversation ID.");
    }

    conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error("Conversation not found.");

    const isParticipant = conversation.participants.some(
      (id) => String(id) === String(senderId)
    );
    if (!isParticipant) throw new Error("You are not a participant in this conversation.");

    const otherParticipant = conversation.participants.find(
      (id) => String(id) !== String(senderId)
    );
    if (!otherParticipant) throw new Error("Invalid direct conversation.");

    if (receiverId && String(receiverId) !== String(otherParticipant)) {
      throw new Error("Receiver does not belong to this conversation.");
    }
    receiverId = otherParticipant;
  } else {
    if (!receiverId) throw new Error("A receiver is required.");
    conversation = await findOrCreateDirectConversation(senderId, receiverId);
  }

  if (String(senderId) === String(receiverId)) {
    throw new Error("You cannot send a message to yourself.");
  }

  const receiverExists = await User.exists({ _id: receiverId });
  if (!receiverExists) throw new Error("Receiver account not found.");

  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    receiver: receiverId,
    text: cleanText,
  });

  const now = message.createdAt || new Date();
  await Conversation.updateOne(
    { _id: conversation._id },
    {
      $set: {
        lastMessage: cleanText,
        lastMessageAt: now,
        lastMessageSender: senderId,
      },
    }
  );

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name avatar")
    .populate("receiver", "name avatar")
    .lean();

  return { conversationId: conversation._id, message: populatedMessage };
}

export async function assertConversationParticipant(conversationId, userId) {
  if (!mongoose.isValidObjectId(conversationId)) return null;
  return Conversation.findOne({ _id: conversationId, participants: userId });
}
