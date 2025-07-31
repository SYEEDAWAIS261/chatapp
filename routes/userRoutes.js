const express = require("express");
const router = express.Router();

const {
  register,
  login,
  // getAllUsers,
  searchUsers,
  logout,
  addContact,
  getContacts
} = require("../controllers/userController");

const protect = require("../middlewares/authMiddleware");


// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
// router.get("/", protect, getAllUsers);
router.get("/search", protect, searchUsers);
// routes/userRoutes.js or equivalent file
router.post('/add-contact/:id', protect, addContact);
router.post("/logout", protect, logout); // optional
router.get("/contacts", protect, getContacts);
module.exports = router;
