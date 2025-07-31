// messagecontroller.js
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");
const { onlineUsers } = require("../sockets/socket"); // access online users map

exports.sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newMessage = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
      status: "sent",
    });

    let populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email")
      .populate({
        path: "chat",
        populate: { path: "users", select: "name email" },
      });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: populatedMessage._id,
    });

    req.io.to(chatId).emit("newMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("❌ Message send failed:", err); // <== Add this
    res.status(500).json({ error: "Message send failed" });
  }
};

// ✅ ADD THIS EXPORT
exports.getChatMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (err) {
    console.error("Failed to get messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// controllers/messageController.js
exports.sendVoiceMessage = async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId || !req.file) {
      return res.status(400).json({ error: "Missing chatId or voice file" });
    }

    // ✅ Log voice file size
    // console.log("🎤 Voice file name:", req.file.filename);
    // console.log("📦 Voice file size (bytes):", req.file.size);
    // console.log("📦 Voice file size (KB):", (req.file.size / 1024).toFixed(2), "KB");

    const message = await Message.create({
      sender: req.user._id,
      chat: chatId,
      voice: req.file.filename,
      type: "voice",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    const populatedMsg = await message.populate("sender", "name email");
    res.json(populatedMsg);
  } catch (err) {
    console.error("❌ Failed to send voice message:", err);
    res.status(500).json({ error: "Failed to send voice message" });
  }
};

exports.reactToMessage = async (req, res) => {
  const { messageId, emoji } = req.body;
  const userId = req.user._id;

  try {
    const message = await Message.findById(messageId);
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingReactionIndex >= 0) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1); // remove reaction
      } else {
        message.reactions[existingReactionIndex].emoji = emoji; // update emoji
      }
    } else {
      message.reactions.push({ emoji, user: userId });
    }

    await message.save();
    const updated = await message.populate("reactions.user", "name");
    req.io.to(message.chat.toString()).emit("reactionUpdate", updated);
    res.json(updated);
  } catch (err) {
    console.error("❌ Reaction error:", err);
    res.status(500).json({ error: "Failed to update reaction" });
  }
};
