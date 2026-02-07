const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    longUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Url", urlSchema);
