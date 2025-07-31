// // backend/sockets/socket.js

// const onlineUsers = new Map();

// const socketHandler = (io) => {
//   io.on("connection", (socket) => {
//     console.log("🟢 A user connected:", socket.id);

//     // Add user to onlineUsers
//     socket.on("add-user", (userId) => {
//       onlineUsers.set(userId, socket.id);
//       console.log("👤 User added:", userId);
//     });

//     // Send message
//     socket.on("send-msg", (data) => {
//       const sendUserSocket = onlineUsers.get(data.to);
//       if (sendUserSocket) {
//         io.to(sendUserSocket).emit("msg-receive", {
//           from: data.from,
//           message: data.message,
//         });

//         // ✅ Send delivery status (tick functionality)
//         io.to(sendUserSocket).emit("message-delivered", {
//           messageId: data.messageId, // must be sent from frontend
//           from: data.from,
//         });
//       }
//     });

//     // Read receipt (✅ functionality)
//     socket.on("message-seen", ({ messageId, to }) => {
//       const toSocket = onlineUsers.get(to);
//       if (toSocket) {
//         io.to(toSocket).emit("message-seen-ack", { messageId });
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("🔴 User disconnected:", socket.id);
//       for (let [userId, socketId] of onlineUsers.entries()) {
//         if (socketId === socket.id) {
//           onlineUsers.delete(userId);
//           break;
//         }
//       }
//     });
//   });
// };

// module.exports = socketHandler;
