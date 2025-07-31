const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reactions: [
  {
    emoji: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
],

    voice: { type: String, default: null },
    type: { type: String, enum: ["text", "voice"], default: "text" },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  { timestamps: true },
  
  
);

module.exports = mongoose.model("Message", messageSchema);