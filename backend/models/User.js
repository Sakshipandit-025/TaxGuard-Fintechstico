const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["accountant", "auditor", "admin"],
    default: "accountant"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);