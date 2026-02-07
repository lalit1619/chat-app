const express = require("express");
const Url = require("../models/Url");

const router = express.Router();

router.get("/:code", async (req, res) => {
  const url = await Url.findOne({ shortCode: req.params.code });
  if (!url) return res.status(404).send("URL not found");

  res.redirect(url.longUrl);
});

module.exports = router;
