const Url = require("../models/Url");
const base62Encode = require("../utils/base62");

const shortenUrl = async (longUrl, userId) => {
  // Check if URL already exists for this user
  let urlDoc = await Url.findOne({ longUrl, userId });
  if (urlDoc) return urlDoc;

  // Create new short code
  const shortCode = base62Encode(Date.now());

  urlDoc = await Url.create({
    userId,
    longUrl,
    shortCode,
  });

  return urlDoc;
};

module.exports = shortenUrl;
