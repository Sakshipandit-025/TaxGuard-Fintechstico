const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static frontend assets (HTML, CSS, Vanilla JS)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Uploads static directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Fallback SPA route for client-side navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  TaxGuard - Intelligent Tax Reconciliation`);
    console.log(`  UI & UX Server running at http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
}

module.exports = app;
