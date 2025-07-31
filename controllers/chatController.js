// chatcontroller.js
const Chat = require("../models/Chat");
const User = require("../models/User");
const Message = require("../models/Message");

// Create or get existing one-on-one chat
exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).send("User ID required");

  try {
    let chat = await Chat.findOne({
      isGroup: false,
      users: { $all: [req.user._id, userId] }
    }).populate("users", "-password").populate("latestMessage");

    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "name email",
    });

    if (chat) return res.status(200).json(chat);

    // Create new chat
    const newChat = await Chat.create({
      name: "sender",
      isGroup: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate("users", "-password");
    res.status(201).json(fullChat);
  } catch (err) {
    res.status(500).json({ message: "Access chat failed", error: err.message });
  }
};

// Get all chats for current user
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const fullChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email",
    });

    res.status(200).json(fullChats);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chats", error: err.message });
  }
};

// Create group chat
exports.createGroupChat = async (req, res) => {
  const { name, users } = req.body;

  if (!users || !name)
    return res.status(400).send("Please provide group name and users");

 const allUsers = Array.isArray(users) ? users : JSON.parse(users);


  if (allUsers.length < 2)
    return res.status(400).send("At least 2 users required for a group");

  allUsers.push(req.user._id); // Add creator to group

  try {
    const groupChat = await Chat.create({
      name,
      isGroup: true,
      users: allUsers,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(groupChat._id).populate("users", "-password").populate("groupAdmin", "-password");
    res.status(201).json(fullGroupChat);
  } catch (err) {
    res.status(500).json({ message: "Failed to create group", error: err.message });
  }
};

// Rename group
exports.renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { name: chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) return res.status(404).send("Chat not found");

    res.json(updatedChat);
  } catch (err) {
    res.status(500).json({ message: "Rename failed", error: err.message });
  }
};

// Add user to group
exports.addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!chat) return res.status(404).send("Chat not found");

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: "Add to group failed", error: err.message });
  }
};

// Remove user from group
exports.removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!chat) return res.status(404).send("Chat not found");

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: "Remove from group failed", error: err.message });
  }
};
