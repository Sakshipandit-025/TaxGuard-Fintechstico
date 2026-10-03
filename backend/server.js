
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reconciliationRoutes = require("./routes/reconciliationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const discrepancyRoutes = require("./routes/discrepancyRoutes");
const caseRoutes = require("./routes/caseRoutes");
const auditRoutes = require("./routes/auditRoutes");

// API route mounting
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reconciliation", reconciliationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/discrepancies", discrepancyRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/audit-logs", auditRoutes);

// Serve frontend static files, if present
const frontendPath = path.join(__dirname, "../frontend/public");

app.use(express.static(frontendPath));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) {
      res.status(404).json({
        message: "TaxGuard API is running. Frontend files were not found."
      });
    }
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "TaxGuard API is running"
  });
});

// Start server after connecting to MongoDB
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`TaxGuard server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
