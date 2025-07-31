// chatroutes.js
const express = require("express");
const router = express.Router();
// const authMiddleware = require("../middleware/auth"); 
const authMiddleware = require("../middlewares/authMiddleware")
const {
  accessChat,
  getUserChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatController");

// ✅ Apply authMiddleware to all routes
router.post("/access", authMiddleware, accessChat);
router.get("/", authMiddleware, getUserChats);
router.post("/group", authMiddleware, createGroupChat);
router.put("/rename", authMiddleware, renameGroup);
router.put("/group-add", authMiddleware, addToGroup);
router.put("/group-remove", authMiddleware, removeFromGroup);

module.exports = router;
