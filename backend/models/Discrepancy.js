const mongoose = require("mongoose");

const discrepancySchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice"
  },
  invoiceNumber: String,
  issueType: String,
  expectedAmount: Number,
  actualAmount: Number,
  difference: Number,
  severity: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"]
  },
  reason: String,
  status: {
    type: String,
    enum: ["OPEN", "UNDER_REVIEW", "RESOLVED"],
    default: "OPEN"
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Discrepancy", discrepancySchema);