import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // A sorted pair of user IDs prevents duplicate one-to-one conversations.
    participantKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lastMessage: {
      type: String,
      default: "",
      maxlength: 5000,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

export default mongoose.model("Conversation", conversationSchema);
