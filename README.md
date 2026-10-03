# TaxGuard – Intelligent Tax Reconciliation

> A calm, professional, and trustworthy fintech web application for automated tax reconciliation, explainable discrepancy detection, and audit workflows.
> Built strictly with **HTML5, CSS3, and Vanilla JavaScript** (Zero React, Zero unnecessary frameworks).

---

## 🚀 Quick Start (Instant Run)

### 1. Install & Run
```bash
npm install
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 👥 Demo Personas (1-Click Login)
The login screen features instant 1-click persona buttons for judge evaluations:

- **Finance User**: `user@taxguard.demo` / `demo123`
- **Auditor**: `auditor@taxguard.demo` / `demo123`
- **Admin**: `admin@taxguard.demo` / `demo123`

---

## 🎨 Implemented UI & UX Screens (Matching Figma Mockups)

1. **Sign in to your account (Screen 1)**
   - Left brand hero with calm fintech gradient, title, and subtitle.
   - Credentials input with password toggle, remember me, and quick-login chips.
2. **User Dashboard (Screen 2)**
   - Personalized greeting (`Good morning, Rajshree 👋`).
   - 4 Metric KPI Cards (`Total Records: 10,000`, `Matched: 8,720 [87%]`, `Issues: 842 [8%]`, `High Priority: 438 [4%]`).
   - Center Donut Chart showing reconciliation status percentages.
   - Recent Discrepancies table with direct `View` links (`INV1023`, `INV1042`, `INV1098`, `INV1102`).
3. **Upload Financial Data (Screen 3)**
   - Drag & drop zone with CSV validation (max 50MB).
   - 3 File Status cards (`invoices.csv`, `transactions.csv`, `accounting_records.csv`) with green checkmarks and size indicators.
   - `[ Use Demo Dataset ]` hackathon button for instant synthetic data initialization.
   - Primary `[ Analyze Data → ]` action.
4. **Processing Screen (Screen 4)**
   - 6-step animated progress stepper:
     1. Validating records
     2. Matching transactions
     3. Checking duplicates
     4. Verifying tax calculations
     5. Detecting anomalies
     6. Generating summary
   - Real-time progress bar from 70% to 100% with automatic transition to Results.
5. **Reconciliation Results (Screen 5)**
   - Tab pills with count indicators: `All (10,000)`, `Matched (8,720)`, `Issues (842)`, `Duplicates (230)`.
   - Search by invoice/merchant and filter dropdowns.
   - Clean data table with priority and status pills.
6. **Discrepancy Details & Investigation (Screen 6)**
   - Header with invoice ID (`INV1023`), priority, and status badge.
   - 3 Side-by-side financial comparison cards:
     - **Invoice Record**: Total Amount, GST Amount, Taxable Amount, Tax Rate.
     - **Transaction Record**: Total Amount, Payment Date, Payment Method, Status.
     - **Accounting Record**: Total Amount, GST Amount, Taxable Amount, Account Code.
   - Detected Discrepancy comparison box (Expected Tax ₹9,000, Recorded Tax ₹7,500, Difference ₹1,500).
   - Factual "Why was this flagged?" explanation box.
   - Statistical Pattern Anomaly score (87/100).
   - Investigation Form with character counter (0/500), file evidence upload, and `[ Submit for Audit ]` CTA.
7. **Auditor Queue (Screen 7)**
   - Pending (12) and Resolved (28) queue tabs.
   - Table with Case ID, Invoice, Issue, Submitter, Date, Priority, and `[ Review ]` button.
8. **Auditor Review (Screen 8)**
   - Case #1023 overview with System Finding, User Finding, and Evidence attachment (`corrected_invoice.pdf`).
   - Real action buttons: `[ Reject & Return ]` and `[ Approve & Resolve ]`.
9. **Admin Dashboard (Screen 9)**
   - User Management table (`Rajshree`, `Priya`, `Sakshi`, `Aman`).
   - Modal for `[ + Add User ]`.
   - Action controls (`•••` toggle active/inactive).
10. **Reports & Audit Logs**
    - High-level reconciliation breakdown.
    - One-click `[ Export CSV ]` that downloads the complete reconciliation report as CSV.
    - Audit log timeline of all system and user operations.

---

## 🤝 Teammate Handover Note
- This codebase contains **purely the UI, UX, and end-to-end Workflow logic**.
- Zero database code or tables are included, so the teammate responsible for the database can integrate their designed Supabase PostgreSQL schema and connections directly without any conflicts.
