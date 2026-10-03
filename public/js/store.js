/**
 * TaxGuard - Professional State & Workflow Store
 * Strict Role Separation: User, Auditor, Admin
 * No personal team member names - purely role-based (Finance User, Auditor, Admin)
 */

const TaxGuardStore = {
  // Current active user - null by default until login
  currentUser: null,

  // KPI Metrics
  metrics: {
    totalRecords: 10000,
    matched: 8720,
    issues: 842,
    highPriority: 438,
    percentages: {
      matched: 87,
      issues: 8,
      duplicates: 3,
      unmatched: 2
    }
  },

  // Discrepancy Records (Flagged items)
  discrepancies: [
    {
      id: 'DISC-INV1023',
      invoice_id: 'INV1023',
      invoice_date: '2025-04-12',
      merchant_name: 'ABC Industrial Supplies Ltd',
      customer_id: 'CORP-802',
      amount: 59000,
      taxable_amount: 50000,
      tax_rate: 18.0,
      gst_amount: 7500,
      total_amount: 59000,
      status: 'Open',
      issue_type: 'Tax mismatch',
      priority: 'High',
      difference_amount: 1500,
      expected_tax: 9000,
      recorded_tax: 7500,
      explanation: {
        taxable_amount: 50000,
        tax_rate: 18.0,
        expected_tax: 9000,
        recorded_tax: 7500,
        difference: 1500,
        reason: 'Recorded tax of ₹7,500 differs from the standard 18% statutory tax calculation of ₹9,000 on taxable amount of ₹50,000.'
      },
      anomaly_score: 87,
      anomaly_reasons: [
        'Transaction value variance detected against statutory tax bracket',
        'Unusual tax calculation pattern requiring compliance verification'
      ],
      transaction: {
        id: 'TXN-INV1023',
        amount: 59000,
        payment_date: '2025-04-12',
        payment_method: 'NEFT / Bank Settlement',
        status: 'SETTLED'
      },
      accounting: {
        id: 'ACC-INV1023',
        recorded_total_amount: 59000,
        recorded_gst_amount: 9000,
        recorded_taxable_amount: 50000,
        account_code: '2100-AP-VENDOR',
        ledger_date: '2025-04-12'
      }
    },
    {
      id: 'DISC-INV1042',
      invoice_id: 'INV1042',
      invoice_date: '2025-04-12',
      merchant_name: 'XYZ Logistics Corporation',
      customer_id: 'CORP-319',
      amount: 50000,
      taxable_amount: 42372.88,
      tax_rate: 18.0,
      gst_amount: 7627.12,
      total_amount: 50000,
      status: 'Open',
      issue_type: 'Payment mismatch',
      priority: 'High',
      difference_amount: 3000,
      expected_tax: 7627.12,
      recorded_tax: 7627.12,
      explanation: {
        taxable_amount: 42372.88,
        tax_rate: 18.0,
        expected_tax: 7627.12,
        recorded_tax: 7627.12,
        difference: 3000,
        reason: 'Gross invoice billed at ₹50,000 but settled net transaction is ₹47,000. Variance of ₹3,000 detected.'
      },
      anomaly_score: 45,
      anomaly_reasons: ['Settlement amount disparity from banking ledger'],
      transaction: {
        id: 'TXN-INV1042',
        amount: 47000,
        payment_date: '2025-04-12',
        payment_method: 'RTGS Electronic Wire',
        status: 'SETTLED'
      },
      accounting: {
        id: 'ACC-INV1042',
        recorded_total_amount: 50000,
        recorded_gst_amount: 7627.12,
        recorded_taxable_amount: 42372.88,
        account_code: '2100-AP-VENDOR',
        ledger_date: '2025-04-12'
      }
    },
    {
      id: 'DISC-INV1098',
      invoice_id: 'INV1098',
      invoice_date: '2025-04-11',
      merchant_name: 'Global Enterprise Network',
      customer_id: 'CORP-104',
      amount: 25000,
      taxable_amount: 21186.44,
      tax_rate: 18.0,
      gst_amount: 3813.56,
      total_amount: 25000,
      status: 'Open',
      issue_type: 'Duplicate',
      priority: 'Medium',
      difference_amount: 25000,
      expected_tax: 3813.56,
      recorded_tax: 3813.56,
      explanation: {
        taxable_amount: 21186.44,
        tax_rate: 18.0,
        expected_tax: 3813.56,
        recorded_tax: 3813.56,
        difference: 25000,
        reason: 'Identical transaction reference processed twice within the same accounting cycle.'
      },
      anomaly_score: 62,
      anomaly_reasons: ['Repetitive billing detected within 24 hours'],
      transaction: {
        id: 'TXN-INV1098-1',
        amount: 25000,
        payment_date: '2025-04-11',
        payment_method: 'Corporate Payment Card',
        status: 'SETTLED'
      },
      accounting: {
        id: 'ACC-INV1098',
        recorded_total_amount: 25000,
        recorded_gst_amount: 3813.56,
        recorded_taxable_amount: 21186.44,
        account_code: '2100-AP-VENDOR',
        ledger_date: '2025-04-11'
      }
    },
    {
      id: 'MATCH-INV1102',
      invoice_id: 'INV1102',
      invoice_date: '2025-04-10',
      merchant_name: 'Apex Tech Solutions',
      customer_id: 'CORP-521',
      amount: 32000,
      taxable_amount: 27118.64,
      tax_rate: 18.0,
      gst_amount: 4881.36,
      total_amount: 32000,
      status: 'MATCHED',
      issue_type: '',
      priority: '',
      difference_amount: 0,
      expected_tax: 4881.36,
      recorded_tax: 4881.36,
      explanation: { reason: 'Clean reconciliation match across all ledgers.' },
      anomaly_score: 10,
      transaction: {
        id: 'TXN-INV1102',
        amount: 32000,
        payment_date: '2025-04-10',
        payment_method: 'Direct Debit UPI',
        status: 'SETTLED'
      },
      accounting: {
        id: 'ACC-INV1102',
        recorded_total_amount: 32000,
        recorded_gst_amount: 4881.36,
        recorded_taxable_amount: 27118.64,
        account_code: '2100-AP-VENDOR',
        ledger_date: '2025-04-10'
      }
    },
    {
      id: 'DISC-INV1134',
      invoice_id: 'INV1134',
      invoice_date: '2025-04-09',
      merchant_name: 'Metropolis Office Hub',
      customer_id: 'CORP-662',
      amount: 18000,
      taxable_amount: 15254.24,
      tax_rate: 18.0,
      gst_amount: 2745.76,
      total_amount: 18000,
      status: 'Open',
      issue_type: 'Date mismatch',
      priority: 'Medium',
      difference_amount: 0,
      expected_tax: 2745.76,
      recorded_tax: 2745.76,
      explanation: {
        reason: 'Settlement confirmed on 25 Apr 2025, exceeding the 14-day statutory grace window from invoice issue date 09 Apr 2025.'
      },
      anomaly_score: 35,
      anomaly_reasons: ['Settlement cycle delayed past standard grace interval'],
      transaction: {
        id: 'TXN-INV1134',
        amount: 18000,
        payment_date: '2025-04-25',
        payment_method: 'NEFT Bank Transfer',
        status: 'SETTLED'
      },
      accounting: {
        id: 'ACC-INV1134',
        recorded_total_amount: 18000,
        recorded_gst_amount: 2745.76,
        recorded_taxable_amount: 15254.24,
        account_code: '2100-AP-VENDOR',
        ledger_date: '2025-04-09'
      }
    },
    {
      id: 'MATCH-INV1187',
      invoice_id: 'INV1187',
      invoice_date: '2025-04-08',
      merchant_name: 'National Retail Distribution',
      customer_id: 'CORP-774',
      amount: 41500,
      taxable_amount: 35169.49,
      tax_rate: 18.0,
      gst_amount: 6330.51,
      total_amount: 41500,
      status: 'MATCHED',
      issue_type: '',
      priority: '',
      difference_amount: 0,
      expected_tax: 6330.51,
      recorded_tax: 6330.51,
      explanation: { reason: 'Clean statutory match confirmed.' },
      anomaly_score: 10,
      transaction: {
        id: 'TXN-INV1187',
        amount: 41500,
        payment_date: '2025-04-08',
        payment_method: 'RTGS Electronic Settlement',
        status: 'SETTLED'
      },
      accounting: {
        id: 'ACC-INV1187',
        recorded_total_amount: 41500,
        recorded_gst_amount: 6330.51,
        recorded_taxable_amount: 35169.49,
        account_code: '2100-AP-VENDOR',
        ledger_date: '2025-04-08'
      }
    }
  ],

  // Tickets & Appeals Workflow System
  // Status: 'PENDING_AUDIT', 'RESOLVED', 'CLOSED_BY_USER', 'CLOSED_BY_ADMIN'
  tickets: [
    {
      id: 'TKT-1023',
      invoice_id: 'INV1023',
      issue_type: 'Tax mismatch',
      priority: 'High',
      difference_amount: 1500,
      expected_tax: 9000,
      recorded_tax: 7500,
      submitted_by: 'Finance User',
      submitted_at: '2025-04-12 10:30 AM',
      user_explanation: 'Statutory GST calculation adjusted in general ledger. Invoice was entered with 15% rate instead of mandatory 18% slab.',
      evidence_file_name: 'corrected_tax_invoice.pdf',
      evidence_file_size: '2.4 MB',
      status: 'RESOLVED', // Auditor has resolved this, awaiting close by user or auto-close by admin
      auditor_notes: 'Verified against statutory rate card. Tax adjustment ledger entry approved.',
      resolved_at: '2025-04-12 11:45 AM',
      resolved_by: 'Auditor',
      auto_close_interval_hours: 48,
      closed_by: null,
      closed_at: null
    },
    {
      id: 'TKT-1042',
      invoice_id: 'INV1042',
      issue_type: 'Payment mismatch',
      priority: 'High',
      difference_amount: 3000,
      expected_tax: 7627.12,
      recorded_tax: 7627.12,
      submitted_by: 'Finance User',
      submitted_at: '2025-04-12 11:15 AM',
      user_explanation: 'Variance of ₹3,000 corresponds to Section 194C TDS deduction retained at source.',
      evidence_file_name: 'tds_deduction_certificate.pdf',
      evidence_file_size: '1.2 MB',
      status: 'PENDING_AUDIT',
      auditor_notes: '',
      resolved_at: null,
      resolved_by: null,
      auto_close_interval_hours: 48,
      closed_by: null,
      closed_at: null
    },
    {
      id: 'TKT-1098',
      invoice_id: 'INV1098',
      issue_type: 'Duplicate',
      priority: 'Medium',
      difference_amount: 25000,
      expected_tax: 3813.56,
      recorded_tax: 3813.56,
      submitted_by: 'Finance User',
      submitted_at: '2025-04-11 02:20 PM',
      user_explanation: 'Gateway timeout caused automated retry. Merchant reversal initiated.',
      evidence_file_name: 'chargeback_acknowledgment.pdf',
      evidence_file_size: '850 KB',
      status: 'PENDING_AUDIT',
      auditor_notes: '',
      resolved_at: null,
      resolved_by: null,
      auto_close_interval_hours: 48,
      closed_by: null,
      closed_at: null
    },
    {
      id: 'TKT-1187',
      invoice_id: 'INV1187',
      issue_type: 'Amount mismatch',
      priority: 'Low',
      difference_amount: 4200,
      expected_tax: 5400,
      recorded_tax: 5400,
      submitted_by: 'Finance User',
      submitted_at: '2025-04-09 09:40 AM',
      user_explanation: 'Approved vendor rebate credit note applied to transaction balance.',
      evidence_file_name: 'rebate_credit_memo.pdf',
      evidence_file_size: '620 KB',
      status: 'CLOSED_BY_USER',
      auditor_notes: 'Credit note reconciled and approved.',
      resolved_at: '2025-04-09 02:15 PM',
      resolved_by: 'Auditor',
      auto_close_interval_hours: 48,
      closed_by: 'Finance User',
      closed_at: '2025-04-10 10:00 AM'
    }
  ],

  // Platform Accounts (Clean Role-Based Names Only)
  users: [
    { id: 'usr-1', name: 'Finance User', email: 'user@taxguard.corp', role: 'USER', status: 'ACTIVE', department: 'Accounts Payable' },
    { id: 'usr-2', name: 'Auditor', email: 'auditor@taxguard.corp', role: 'AUDITOR', status: 'ACTIVE', department: 'Compliance & Audit' },
    { id: 'usr-3', name: 'Admin', email: 'admin@taxguard.corp', role: 'ADMIN', status: 'ACTIVE', department: 'System Administration' },
    { id: 'usr-4', name: 'Senior Accounting Officer', email: 'accounting@taxguard.corp', role: 'USER', status: 'ACTIVE', department: 'Financial Control' },
    { id: 'usr-5', name: 'External Tax Inspector', email: 'inspector@taxguard.corp', role: 'AUDITOR', status: 'INACTIVE', department: 'Regulatory Review' }
  ],

  // System Audit Trail
  auditLogs: [
    { timestamp: '12 Apr 2025, 11:45 AM', user: 'Auditor', action: 'RESOLVE_TICKET', entity: 'Ticket #TKT-1023', description: 'Auditor approved resolution for INV1023 tax calculation variance' },
    { timestamp: '12 Apr 2025, 10:30 AM', user: 'Finance User', action: 'RAISE_TICKET', entity: 'Ticket #TKT-1023', description: 'Finance User raised appeal for INV1023 tax mismatch (₹1,500)' },
    { timestamp: '12 Apr 2025, 10:15 AM', user: 'System', action: 'RECONCILIATION_RUN', entity: 'Engine', description: 'Reconciliation batch processed 10,000 records. Detected 842 discrepancies' },
    { timestamp: '12 Apr 2025, 10:00 AM', user: 'Finance User', action: 'UPLOAD_DATA', entity: 'Dataset', description: 'Finance User uploaded invoices.csv, transactions.csv, accounting_records.csv' },
    { timestamp: '10 Apr 2025, 10:00 AM', user: 'Finance User', action: 'CLOSE_TICKET', entity: 'Ticket #TKT-1187', description: 'Finance User closed resolved ticket TKT-1187' },
    { timestamp: '01 Apr 2025, 09:00 AM', user: 'Admin', action: 'INITIALIZE', entity: 'Platform', description: 'TaxGuard initialized with standard Indian GST statutory rules (5%, 12%, 18%, 28%)' }
  ]
};

window.TaxGuardStore = TaxGuardStore;
