const Message = require("../models/Message");
const User = require("../models/User");
const shortenUrl = require("../controllers/urlController");

/* ============================
   In-memory stores
   ============================ */
const onlineUsers = new Map();        // userId -> socketId
const messageRateStore = new Map();   // userId -> timestamps[]

/* ============================
   Config
   ============================ */
const MESSAGE_LIMIT = 20;             // max messages
const WINDOW_MS = 60 * 1000;           // per minute
const urlRegex = /(https?:\/\/[^\s]+)/g;

module.exports = (io) => {
  io.on("connection", (socket) => {
    /* ============================
       USER ONLINE
       ============================ */
    socket.on("user_online", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("online_users", [...onlineUsers.keys()]);
    });

    /* ============================
       TYPING INDICATOR
       ============================ */
    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId });
      }
    });

    socket.on("stop_typing", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stop_typing", { senderId });
      }
    });

    /* ============================
       SEND MESSAGE
       ============================ */
    socket.on("send_message", async ({ senderId, receiverId, content }) => {
      try {
        /* ---------- FRIEND CHECK (SECURITY) ---------- */
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) return;

        const isFriend =
          sender.friends.includes(receiverId) &&
          receiver.friends.includes(senderId);

        if (!isFriend) {
          console.log("❌ Message blocked: users are not friends");
          return socket.emit("chat_error", {
            error: "You can only chat with friends",
          });
        }

        /* ---------- RATE LIMITING ---------- */
        const now = Date.now();
        const timestamps = messageRateStore.get(senderId) || [];
        const recent = timestamps.filter((t) => now - t < WINDOW_MS);

        if (recent.length >= MESSAGE_LIMIT) {
          return socket.emit("rate_limit_error", {
            error: "Too many messages. Please wait.",
          });
        }

        recent.push(now);
        messageRateStore.set(senderId, recent);

        /* ---------- URL DETECTION & SHORTENING ---------- */
        const urls = content.match(urlRegex);
        if (urls) {
          for (let url of urls) {
            const short = await shortenUrl(url, senderId);
            content = content.replace(
              url,
              `http://localhost:5000/u/${short.shortCode}`
            );
          }
        }

        /* ---------- SAVE MESSAGE ---------- */
        const msg = await Message.create({
          senderId,
          receiverId,
          content,
        });

        /* ---------- REAL-TIME DELIVERY ---------- */
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit("receive_message", msg);
        }

        socket.emit("receive_message", msg);
      } catch (err) {
        console.error("❌ Send message error:", err);
      }
    });

    /* ============================
       DISCONNECT
       ============================ */
    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("online_users", [...onlineUsers.keys()]);
    });
  });
};
