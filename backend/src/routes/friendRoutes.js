const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================
   SEND FRIEND REQUEST
   ============================ */
router.post("/request", authMiddleware, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID required" });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ error: "You cannot add yourself" });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // Already friends
    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ error: "Already friends" });
    }

    // Request already sent
    if (sender.sentRequests.includes(receiverId)) {
      return res.status(400).json({ error: "Request already sent" });
    }

    // Add request
    sender.sentRequests.push(receiverId);
    receiver.receivedRequests.push(senderId);

    await sender.save();
    await receiver.save();

    res.json({ message: "Friend request sent" });
  } catch (err) {
    console.error("❌ Friend request error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================
   GET RECEIVED FRIEND REQUESTS
   ============================ */
router.get("/requests", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "receivedRequests",
      "username email"
    );

    res.json(user.receivedRequests);
  } catch (err) {
    console.error("❌ Get requests error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================
   ACCEPT FRIEND REQUEST
   ============================ */
router.post("/accept", authMiddleware, async (req, res) => {
  try {
    const receiverId = req.user.id;
    const { senderId } = req.body;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!receiver.receivedRequests.includes(senderId)) {
      return res.status(400).json({ error: "No such request" });
    }

    // Remove from requests
    receiver.receivedRequests = receiver.receivedRequests.filter(
      (id) => id.toString() !== senderId
    );
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== receiverId
    );

    // Add to friends
    receiver.friends.push(senderId);
    sender.friends.push(receiverId);

    await receiver.save();
    await sender.save();

    res.json({ message: "Friend request accepted" });
  } catch (err) {
    console.error("❌ Accept request error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================
   REJECT FRIEND REQUEST
   ============================ */
router.post("/reject", authMiddleware, async (req, res) => {
  try {
    const receiverId = req.user.id;
    const { senderId } = req.body;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ error: "User not found" });
    }

    receiver.receivedRequests = receiver.receivedRequests.filter(
      (id) => id.toString() !== senderId
    );
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== receiverId
    );

    await receiver.save();
    await sender.save();

    res.json({ message: "Friend request rejected" });
  } catch (err) {
    console.error("❌ Reject request error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================
   GET FRIENDS LIST
   ============================ */
router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("friends", "username email");

  res.json(user.friends);
});

module.exports = router;
