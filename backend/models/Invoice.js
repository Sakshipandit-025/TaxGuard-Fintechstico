const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  vendorName: { type: String, required: true },
  invoiceDate: Date,
  taxableAmount: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  uploadBatchId: { type: String, required: true },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

invoiceSchema.index(
  { uploadBatchId: 1, invoiceNumber: 1, vendorName: 1 },
  { unique: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);