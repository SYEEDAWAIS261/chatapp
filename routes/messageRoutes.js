// messageroutes.js
const multer = require("multer");
const auth = require("../middlewares/authMiddleware"); // ✅ This was missing
const path = require("path");
const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getChatMessages,
  sendVoiceMessage,
  reactToMessage,
} = require("../controllers/messageController");

const authMiddleware = require("../middlewares/authMiddleware")

// ✅ USE THE AUTH MIDDLEWARE ON BOTH ROUTES
router.post("/", authMiddleware, sendMessage);
router.get("/:chatId", authMiddleware, getChatMessages);
router.post("/react", authMiddleware, reactToMessage);

// Setup storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/voices");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Voice message route
// router.post("/voice", authMiddleware, upload.single("voice"), sendVoiceMessage);
router.post("/voice", (req, res, next) => {
  // console.log("Headers:", req.headers);
  next();
}, authMiddleware, upload.single("voice"), sendVoiceMessage);

module.exports = router;
