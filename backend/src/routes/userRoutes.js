const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================
   SEARCH USERS (Friend-safe)
   ============================ */
router.get("/search", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const query = req.query.q;

    if (!query) {
      return res.json([]);
    }

    const currentUser = await User.findById(userId);

    // IDs to exclude from search results
    const excludeIds = [
      userId,
      ...currentUser.friends,
      ...currentUser.sentRequests,
      ...currentUser.receivedRequests,
    ];

    const users = await User.find({
      _id: { $nin: excludeIds },
      username: { $regex: query, $options: "i" },
    }).select("_id username email");

    res.json(users);
  } catch (err) {
    console.error("❌ User search error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
