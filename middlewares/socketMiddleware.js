// middleware/socketMiddleware.js

const Message = require("../models/Message");

const users = new Map(); // socket.id -> userId
const userSockets = new Map(); // userId -> Set(socket.id)

module.exports = (io) => {
  io.on("connection", (socket) => {
    // console.log("🔌 User connected:", socket.id);

    // Register a user with their socket
    socket.on("register", (userId) => {
      users.set(socket.id, userId);

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      // console.log(`🟢 User ${userId} registered with socket ${socket.id}`);
    });

    // Message sent to recipient
    socket.on("send-message", async ({ chatId, message, recipientId }) => {
      const senderId = users.get(socket.id);
      if (!senderId) return;

      const isRecipientOnline = userSockets.has(recipientId);

      if (isRecipientOnline) {
        for (const sId of userSockets.get(recipientId)) {
          io.to(sId).emit("receive-message", message);
        }

        // ✅ Update message status to "delivered" in DB
        await Message.findByIdAndUpdate(message._id, { status: "delivered" });

        // ✅ Emit status back to sender
        for (const sId of userSockets.get(senderId)) {
          io.to(sId).emit("message-status-update", {
            messageId: message._id,
            status: "delivered",
          });
        }
      } else {
        // Offline: emit "sent" back to sender
        for (const sId of userSockets.get(senderId)) {
          io.to(sId).emit("message-status-update", {
            messageId: message._id,
            status: "sent",
          });
        }
      }
    });

    // Message seen by recipient
    socket.on("message-seen", async ({ messageId, to }) => {
      const viewerId = users.get(socket.id);
      if (!viewerId) return;

      await Message.findByIdAndUpdate(messageId, { status: "seen" });

      // Notify the sender (original sender of the message)
      if (userSockets.has(to)) {
        for (const sId of userSockets.get(to)) {
          io.to(sId).emit("message-status-update", {
            messageId,
            status: "seen",
          });
        }
      }
    });

        // Message delivered manually (optional, if frontend emits it)
    socket.on("message-delivered", async ({ messageId, chatId, receiverId }) => {
      const fromId = users.get(socket.id);
      if (!fromId) return;

      await Message.findByIdAndUpdate(messageId, { status: "delivered" });

      // Notify sender
      if (userSockets.has(fromId)) {
        for (const sId of userSockets.get(fromId)) {
          io.to(sId).emit("message-status-update", {
            messageId,
            status: "delivered",
          });
        }
      }

      // Optional: notify recipient if needed
      if (userSockets.has(receiverId)) {
        for (const sId of userSockets.get(receiverId)) {
          io.to(sId).emit("message-status-update", {
            messageId,
            status: "delivered",
          });
        }
      }
    });


    // Handle disconnect
    socket.on("disconnect", () => {
      const userId = users.get(socket.id);
      users.delete(socket.id);

      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
        }
      }

      console.log(`❌ Disconnected socket: ${socket.id}`);
    });
  });
};

