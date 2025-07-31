const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log("✅ Decoded token:", decoded);

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      console.warn("⚠️ Token valid but user no longer exists.");
      return res.status(404).json({ error: "User not found." });
    }

    req.user = user; // Attach authenticated user to request
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
