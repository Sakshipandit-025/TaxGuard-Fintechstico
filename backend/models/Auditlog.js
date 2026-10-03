const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  action: { type: String, required: true },
  entityType: String,
  entityId: String,
  details: String
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditLogSchema);