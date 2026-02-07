const express = require("express");
const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:userId", auth, async (req, res) => {
  const myId = req.user.id;
  const otherId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: otherId },
      { senderId: otherId, receiverId: myId },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = router;
