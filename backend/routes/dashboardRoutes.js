
const express = require("express");
const Invoice = require("../models/Invoice");
const Discrepancy = require("../models/Discrepancy");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.get("/summary", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalInvoices,
      totalDiscrepancies,
      openDiscrepancies,
      underReviewDiscrepancies,
      resolvedDiscrepancies,
      highSeverity
    ] = await Promise.all([
      Invoice.countDocuments({ uploadedBy: userId }),
      Discrepancy.countDocuments({ uploadedBy: userId }),
      Discrepancy.countDocuments({
        uploadedBy: userId,
        status: "OPEN"
      }),
      Discrepancy.countDocuments({
        uploadedBy: userId,
        status: "UNDER_REVIEW"
      }),
      Discrepancy.countDocuments({
        uploadedBy: userId,
        status: "RESOLVED"
      }),
      Discrepancy.countDocuments({
        uploadedBy: userId,
        severity: "HIGH"
      })
    ]);

    res.json({
      totalInvoices,
      totalDiscrepancies,
      openDiscrepancies,
      underReviewDiscrepancies,
      resolvedDiscrepancies,
      highSeverity
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({
      error: "Could not load dashboard"
    });
  }
});

module.exports = router;
