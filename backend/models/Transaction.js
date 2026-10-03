const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  invoiceNumber: String,
  vendorName: String,
  date: Date,
  amount: { type: Number, required: true },
  uploadBatchId: { type: String, required: true },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);