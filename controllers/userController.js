const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// ============================
// Register
// ============================
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

// ============================
// Login
// ============================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
};

// ============================
// Search Users
// ============================
exports.searchUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  try {
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.status(200).json(users);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to search users" });
  }
};

// ============================
// Get All Users (e.g. for contacts)
// ============================
// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find({ _id: { $ne: req.user._id } });
//     res.status(200).json(users);
//   } catch (err) {
//     console.error("Fetching users failed:", err);
//     res.status(500).json({ error: "Failed to fetch users" });
//   }
// };

// ============================
// Logout (Optional placeholder)
// ============================
exports.logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
};

// controllers/userController.js
exports.addContact = async (req, res) => {
  const contactId = req.params.id; // ✅ Get from URL

  if (!contactId) {
    return res.status(400).json({ error: "Contact ID is required" });
  }

  try {
    const user = await User.findById(req.user._id);

    // Check if already added
    if (user.contacts.includes(contactId)) {
      return res.status(400).json({ error: "Contact already added" });
    }

    user.contacts.push(contactId);
    await user.save();

    const updatedUser = await user.populate("contacts", "name email");

    res.status(200).json({
      message: "Contact added successfully",
      contacts: updatedUser.contacts,
    });
  } catch (err) {
    console.error("Add contact error:", err);
    res.status(500).json({ error: "Failed to add contact" });
  }
};


// controllers/userController.js
exports.getContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("contacts", "name email");
    res.status(200).json(user.contacts);
  } catch (err) {
    console.error("Get contacts error:", err);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

