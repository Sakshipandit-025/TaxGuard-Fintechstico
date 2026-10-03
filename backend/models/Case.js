
const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    discrepancyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discrepancy",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    explanation: {
      type: String,
      default: ""
    },

    evidence: {
      type: [String],
      default: []
    },

    returnReason: {
      type: String,
      default: ""
    },

    escalationReason: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "SUBMITTED",
        "RESOLVED",
        "REQUIRES_ACTION",
        "ESCALATED"
      ],
      default: "OPEN"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
