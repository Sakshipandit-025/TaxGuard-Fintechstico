
const express = require("express");
const mongoose = require("mongoose");

const Case = require("../models/Case");
const AuditLog = require("../models/AuditLog");
const Discrepancy = require("../models/Discrepancy");
const { auth, allowRoles } = require("../middleware/auth");

const router = express.Router();

const CASE_STATUSES = [
  "OPEN",
  "SUBMITTED",
  "RESOLVED",
  "REQUIRES_ACTION",
  "ESCALATED"
];

// Find a discrepancy owned by the logged-in user.
async function getOwnedDiscrepancy(discrepancyId, userId) {
  return Discrepancy.findOne({
    _id: discrepancyId,
    uploadedBy: userId
  });
}

// Find a case linked to a discrepancy owned by the logged-in user.
async function getOwnedCase(caseId, userId) {
  if (!mongoose.Types.ObjectId.isValid(caseId)) {
    return null;
  }

  return Case.findOne({ _id: caseId })
    .populate({
      path: "discrepancyId",
      match: { uploadedBy: userId }
    });
}

// Record an action in the audit log.
async function logAction(userId, action, item, details = "") {
  return AuditLog.create({
    userId,
    action,
    entityType: "Case",
    entityId: item._id.toString(),
    details
  });
}

// GET /api/cases
// List cases and return pending review count.
// Optional filter: /api/cases?status=SUBMITTED
router.get(
  "/",
  auth,
  allowRoles("accountant", "auditor", "admin"),
  async (req, res) => {
    try {
      const { status } = req.query;

      if (status && !CASE_STATUSES.includes(status)) {
        return res.status(400).json({
          error: "Invalid case status"
        });
      }

      const discrepancies = await Discrepancy.find({
        uploadedBy: req.user.id
      }).select("_id");

      const discrepancyIds = discrepancies.map(
        discrepancy => discrepancy._id
      );

      const filter = {
        discrepancyId: { $in: discrepancyIds }
      };

      if (status) {
        filter.status = status;
      }

      const cases = await Case.find(filter)
        .populate({
          path: "discrepancyId",
          select: "invoiceId invoiceNumber issueType severity status expectedAmount actualAmount difference reason"
        })
        .populate("assignedTo", "name email")
        .sort({ updatedAt: -1 });

      const pendingReviewCount = await Case.countDocuments({
        discrepancyId: { $in: discrepancyIds },
        status: "SUBMITTED"
      });

      return res.json({
        count: cases.length,
        pendingReviewCount,
        cases
      });
    } catch (err) {
      console.error("List cases error:", err);

      return res.status(500).json({
        error: "Could not fetch cases"
      });
    }
  }
);

// GET /api/cases/:id
// Get one case, discrepancy details and audit history.
router.get(
  "/:id",
  auth,
  allowRoles("accountant", "auditor", "admin"),
  async (req, res) => {
    try {
      const item = await getOwnedCase(
        req.params.id,
        req.user.id
      );

      if (!item || !item.discrepancyId) {
        return res.status(404).json({
          error: "Case not found"
        });
      }

      const auditLogs = await AuditLog.find({
        entityType: "Case",
        entityId: item._id.toString()
      })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(50);

      return res.json({
        case: item,
        auditLogs
      });
    } catch (err) {
      console.error("Case detail error:", err);

      return res.status(500).json({
        error: "Could not fetch case"
      });
    }
  }
);

// POST /api/cases
// Create a case from an owned discrepancy.
// Body: { "discrepancyId": "..." }
router.post(
  "/",
  auth,
  allowRoles("accountant", "admin"),
  async (req, res) => {
    try {
      const { discrepancyId } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(discrepancyId)) {
        return res.status(400).json({
          error: "Valid discrepancyId is required"
        });
      }

      const discrepancy = await getOwnedDiscrepancy(
        discrepancyId,
        req.user.id
      );

      if (!discrepancy) {
        return res.status(404).json({
          error: "Discrepancy not found"
        });
      }

      // Avoid creating a second case for the same discrepancy.
      const existingCase = await Case.findOne({
        discrepancyId
      });

      if (existingCase) {
        return res.status(200).json({
          message: "Case already exists",
          case: existingCase
        });
      }

      const item = await Case.create({
        discrepancyId,
        status: "OPEN"
      });

      await logAction(
        req.user.id,
        "CASE_CREATED",
        item,
        "Case created for discrepancy " + discrepancyId
      );

      return res.status(201).json({
        message: "Case created",
        case: item
      });
    } catch (err) {
      console.error("Create case error:", err);

      return res.status(500).json({
        error: "Could not create case"
      });
    }
  }
);

// PATCH /api/cases/:id
// Accountant edits an OPEN or returned case and can submit it.
// Body example:
// {
//   "explanation": "Reviewed invoice and transaction",
//   "evidence": ["invoice.pdf"],
//   "status": "SUBMITTED"
// }
router.patch(
  "/:id",
  auth,
  allowRoles("accountant", "admin"),
  async (req, res) => {
    try {
      const item = await getOwnedCase(
        req.params.id,
        req.user.id
      );

      if (!item || !item.discrepancyId) {
        return res.status(404).json({
          error: "Case not found"
        });
      }

      const { explanation, evidence, status } = req.body;

      const editableStatuses = [
        "OPEN",
        "REQUIRES_ACTION"
      ];

      if (
        !editableStatuses.includes(item.status) &&
        req.user.role !== "admin"
      ) {
        return res.status(400).json({
          error: "Only OPEN or REQUIRES_ACTION cases can be edited"
        });
      }

      if (
        status !== undefined &&
        !["OPEN", "SUBMITTED"].includes(status)
      ) {
        return res.status(400).json({
          error: "Status must be OPEN or SUBMITTED"
        });
      }

      if (
        explanation !== undefined &&
        typeof explanation !== "string"
      ) {
        return res.status(400).json({
          error: "Explanation must be text"
        });
      }

      if (
        evidence !== undefined &&
        (
          !Array.isArray(evidence) ||
          !evidence.every(value => typeof value === "string")
        )
      ) {
        return res.status(400).json({
          error: "Evidence must be an array of strings"
        });
      }

      const oldStatus = item.status;

      if (explanation !== undefined) {
        item.explanation = explanation;
      }

      if (evidence !== undefined) {
        item.evidence = evidence;
      }

      if (status !== undefined) {
        item.status = status;
      }

      // Clear old return reason when the case is resubmitted.
      if (item.status === "SUBMITTED") {
        item.returnReason = "";
      }

      await item.save();

      const action =
        oldStatus !== item.status && item.status === "SUBMITTED"
          ? "CASE_SUBMITTED"
          : "CASE_UPDATED";

      await logAction(
        req.user.id,
        action,
        item,
        `Status: ${oldStatus} -> ${item.status}`
      );

      return res.json({
        message: "Case updated",
        case: item
      });
    } catch (err) {
      console.error("Update case error:", err);

      return res.status(500).json({
        error: "Could not update case"
      });
    }
  }
);

// PATCH /api/cases/:id/action
// Auditor actions:
// { "action": "APPROVE" }
// { "action": "RETURN", "reason": "Please provide evidence" }
// { "action": "ESCALATE", "reason": "Needs additional review" }
router.patch(
  "/:id/action",
  auth,
  allowRoles("auditor", "admin"),
  async (req, res) => {
    try {
      const item = await getOwnedCase(
        req.params.id,
        req.user.id
      );

      if (!item || !item.discrepancyId) {
        return res.status(404).json({
          error: "Case not found"
        });
      }

      const { action, reason } = req.body;

      if (!["APPROVE", "RETURN", "ESCALATE"].includes(action)) {
        return res.status(400).json({
          error: "Action must be APPROVE, RETURN, or ESCALATE"
        });
      }

      if (item.status !== "SUBMITTED") {
        return res.status(400).json({
          error: "Only SUBMITTED cases can be reviewed"
        });
      }

      if (
        ["RETURN", "ESCALATE"].includes(action) &&
        (
          typeof reason !== "string" ||
          !reason.trim()
        )
      ) {
        return res.status(400).json({
          error: "A reason is required for return or escalation"
        });
      }

      const oldStatus = item.status;

      if (action === "APPROVE") {
        item.status = "RESOLVED";
        item.returnReason = "";
        item.escalationReason = "";
      }

      if (action === "RETURN") {
        item.status = "REQUIRES_ACTION";
        item.returnReason = reason.trim();
      }

      if (action === "ESCALATE") {
        item.status = "ESCALATED";
        item.escalationReason = reason.trim();
      }

      await item.save();

      // Approval also resolves the linked discrepancy.
      if (action === "APPROVE") {
        await Discrepancy.updateOne(
          {
            _id: item.discrepancyId._id,
            uploadedBy: req.user.id
          },
          {
            $set: { status: "RESOLVED" }
          }
        );
      }

      await logAction(
        req.user.id,
        `CASE_${action}`,
        item,
        `Status: ${oldStatus} -> ${item.status}` +
          (
            reason
              ? `. Reason: ${reason.trim()}`
              : ""
          )
      );

      return res.json({
        message: `Case ${action.toLowerCase()} successful`,
        case: item
      });
    } catch (err) {
      console.error("Auditor action error:", err);

      return res.status(500).json({
        error: "Could not process auditor action"
      });
    }
  }
);

module.exports = router;
