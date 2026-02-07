const rateLimitStore = new Map();
// userId → [timestamps]

const rateLimiter = (limit, windowMs) => {
  return (req, res, next) => {
    try {
      const userId = req.user?.userId;

      // If user is not authenticated, block
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const currentTime = Date.now();

      if (!rateLimitStore.has(userId)) {
        rateLimitStore.set(userId, []);
      }

      // Get timestamps
      const timestamps = rateLimitStore.get(userId);

      // Remove old timestamps
      const updatedTimestamps = timestamps.filter(
        (time) => currentTime - time < windowMs
      );

      // Check limit
      if (updatedTimestamps.length >= limit) {
        return res.status(429).json({
          error: "Too many requests. Please try again later.",
        });
      }

      // Add new timestamp
      updatedTimestamps.push(currentTime);
      rateLimitStore.set(userId, updatedTimestamps);

      next();
    } catch (error) {
      res.status(500).json({ error: "Rate limiter error" });
    }
  };
};

module.exports = rateLimiter;
