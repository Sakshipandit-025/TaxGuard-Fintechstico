
const express = require("express");
const Invoice = require("../models/Invoice");
const Transaction = require("../models/Transaction");
const Discrepancy = require("../models/Discrepancy");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/run", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get only this user's invoices and transactions
    const invoices = await Invoice.find({
      uploadedBy: userId
    });

    const transactions = await Transaction.find({
        uploadedBy: req.user.id
    });

    const results = [];

    // Match transactions to invoices
    for (const invoice of invoices) {
      const matches = transactions.filter(
        t => t.invoiceNumber === invoice.invoiceNumber
      );

      if (matches.length === 0) {
        results.push({
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          issueType: "MISSING_TRANSACTION",
          expectedAmount: invoice.totalAmount,
          actualAmount: 0,
          difference: invoice.totalAmount,
          severity: "HIGH",
          reason: "No transaction found for invoice"
        });

        continue;
      }

      const transactionTotal = matches.reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
      );

      const difference = Math.round(
        (invoice.totalAmount - transactionTotal) * 100
      ) / 100;

      if (Math.abs(difference) > 0.01) {
        results.push({
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          issueType: "AMOUNT_MISMATCH",
          expectedAmount: invoice.totalAmount,
          actualAmount: transactionTotal,
          difference,
          severity: Math.abs(difference) >= 1000
            ? "HIGH"
            : "MEDIUM",
          reason: "Invoice total differs from transaction total"
        });
      }
    }

    // Remove previous discrepancies for these invoices
    // so repeated runs do not create duplicates.
    const invoiceIds = invoices.map(invoice => invoice._id);

    if (invoiceIds.length > 0) {
      await Discrepancy.deleteMany({
        invoiceId: { $in: invoiceIds }
      });
    }

    // Save the latest discrepancies with user ownership
    const saved = results.length > 0
      ? await Discrepancy.insertMany(
          results.map(result => ({
            ...result,
            uploadedBy: userId
          }))
        )
      : [];

    res.json({
      message: "Reconciliation completed",
      invoicesChecked: invoices.length,
      discrepanciesFound: saved.length,
      discrepancies: saved
    });
  } catch (err) {
    console.error("Reconciliation error:", err.message);

    res.status(500).json({
      error: "Reconciliation failed"
    });
  }
});

module.exports = router;
