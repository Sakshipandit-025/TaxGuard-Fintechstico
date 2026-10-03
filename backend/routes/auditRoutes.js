const express = require("express");
const AuditLog = require("../models/AuditLog");
const { auth, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, allowRoles("auditor", "admin"), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "name email");

    res.json(logs);
  } catch {
    res.status(500).json({ error: "Could not retrieve audit logs" });
  }
});

module.exports = router;