const express = require("express");
const multer = require("multer");
const { parse } = require("csv-parse/sync");
const { randomUUID } = require("crypto");
const Invoice = require("../models/Invoice");
const Transaction = require("../models/Transaction");
const { auth } = require("../middleware/auth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Please upload a CSV file"));
    }
  }
});

function readCSV(buffer) {
  return parse(buffer.toString("utf8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

router.post("/invoices", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    const rows = readCSV(req.file.buffer);
    const batchId = randomUUID();

    const docs = rows.map((r, i) => {
      const taxableAmount = Number(r.taxableAmount);
      const taxAmount = Number(r.taxAmount);
      const totalAmount = Number(r.totalAmount);

      if (
        !r.invoiceNumber ||
        !r.vendorName ||
        !Number.isFinite(taxableAmount) ||
        !Number.isFinite(taxAmount) ||
        !Number.isFinite(totalAmount) ||
        taxableAmount < 0 || taxAmount < 0 || totalAmount < 0
      ) {
        throw new Error(`Invalid data in CSV row ${i + 2}`);
      }

      return {
        invoiceNumber: r.invoiceNumber,
        vendorName: r.vendorName,
        invoiceDate: r.invoiceDate ? new Date(r.invoiceDate) : undefined,
        taxableAmount,
        taxAmount,
        totalAmount,
        uploadBatchId: batchId,
        uploadedBy: req.user.id
      };
    });

    if (!docs.length) {
      return res.status(400).json({ error: "CSV contains no records" });
    }

    const saved = await Invoice.insertMany(docs);

    res.status(201).json({
      message: "Invoices uploaded",
      count: saved.length,
      batchId
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.post("/transactions", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    const rows = readCSV(req.file.buffer);
    const batchId = randomUUID();

    const docs = rows.map((r, i) => {
      const amount = Number(r.amount);

      if (!r.transactionId || !Number.isFinite(amount) || amount < 0) {
        throw new Error(`Invalid data in CSV row ${i + 2}`);
      }

      return {
        transactionId: r.transactionId,
        invoiceNumber: r.invoiceNumber,
        vendorName: r.vendorName,
        date: r.date ? new Date(r.date) : undefined,
        amount,
        uploadBatchId: batchId,
        uploadedBy: req.user.id
      };
    });

    if (!docs.length) {
      return res.status(400).json({ error: "CSV contains no records" });
    }

    const saved = await Transaction.insertMany(docs);

    res.status(201).json({
      message: "Transactions uploaded",
      count: saved.length,
      batchId
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
