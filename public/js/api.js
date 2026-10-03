/**
 * TaxGuard - State Client & Workflow Engine
 * Pure UI/UX and Workflow State without backend database dependency.
 */

const api = {
  getToken() {
    return localStorage.getItem('taxguard_token') || 'auth-session-token';
  },

  setToken(token) {
    if (token) localStorage.setItem('taxguard_token', token);
    else localStorage.removeItem('taxguard_token');
  },

  getUser() {
    try {
      const u = localStorage.getItem('taxguard_user');
      return u ? JSON.parse(u) : TaxGuardStore.currentUser;
    } catch (e) {
      return TaxGuardStore.currentUser;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('taxguard_user', JSON.stringify(user));
      TaxGuardStore.currentUser = user;
    } else {
      localStorage.removeItem('taxguard_user');
    }
  },

  logout() {
    this.setToken(null);
    this.setUser(null);
    window.location.hash = '#login';
    window.location.reload();
  },

  // Auth
  async login(email, password, selectedRole) {
    const role = selectedRole || (email.includes('auditor') ? 'AUDITOR' : email.includes('admin') ? 'ADMIN' : 'USER');
    const name = role === 'AUDITOR' ? 'Auditor' : role === 'ADMIN' ? 'Admin' : 'Finance User';
    const user = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      status: 'ACTIVE'
    };
    this.setUser(user);
    this.setToken('auth-session-token');
    return { token: 'auth-session-token', user };
  },

  async getMe() {
    return { user: this.getUser() };
  },

  // Dashboard
  async getDashboardSummary() {
    const recent = TaxGuardStore.discrepancies.filter(d => d.issue_type).slice(0, 4);
    return {
      totalRecords: TaxGuardStore.metrics.totalRecords,
      matched: TaxGuardStore.metrics.matched,
      issues: TaxGuardStore.metrics.issues,
      highPriority: TaxGuardStore.metrics.highPriority,
      percentages: TaxGuardStore.metrics.percentages,
      recentDiscrepancies: recent
    };
  },

  // Upload & Sample Data
  async useSampleDataset() {
    TaxGuardStore.metrics = {
      totalRecords: 10000,
      matched: 8720,
      issues: 842,
      highPriority: 438,
      percentages: { matched: 87, issues: 8, duplicates: 3, unmatched: 2 }
    };
    return { success: true, message: 'Sample dataset loaded (10,000 records).' };
  },

  // Reconciliation
  async runReconciliation() {
    return {
      success: true,
      summary: {
        totalRecords: 10000,
        matched: 8720,
        issues: 842,
        highPriority: 438,
        discrepanciesFound: 842
      }
    };
  },

  async getReconciliationResults(params = {}) {
    const { tab = 'all', search = '', status = '', issueType = '' } = params;
    let items = TaxGuardStore.discrepancies;

    if (tab === 'matched') {
      items = items.filter(d => d.status === 'MATCHED');
    } else if (tab === 'issues') {
      items = items.filter(d => d.issue_type && d.issue_type !== 'Duplicate');
    } else if (tab === 'duplicates') {
      items = items.filter(d => d.issue_type === 'Duplicate');
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(d => 
        d.invoice_id.toLowerCase().includes(q) || 
        d.merchant_name.toLowerCase().includes(q) ||
        String(d.total_amount).includes(q)
      );
    }

    if (status) {
      items = items.filter(d => d.status === status);
    }

    if (issueType) {
      items = items.filter(d => d.issue_type === issueType);
    }

    return {
      tabCounts: {
        all: 10000,
        matched: 8720,
        issues: 842,
        duplicates: 230
      },
      pagination: {
        total: items.length,
        page: 1,
        limit: 10,
        totalPages: 1
      },
      results: items
    };
  },

  // Discrepancies
  async getDiscrepancy(id) {
    const local = TaxGuardStore.discrepancies.find(d => d.invoice_id === id || d.id === id) || TaxGuardStore.discrepancies[0];
    const caseRec = TaxGuardStore.cases.find(c => c.invoice_id === local.invoice_id);

    return {
      discrepancy: local,
      invoice: {
        id: local.invoice_id,
        invoice_date: local.invoice_date,
        merchant_name: local.merchant_name,
        taxable_amount: local.taxable_amount,
        tax_rate: local.tax_rate,
        gst_amount: local.gst_amount,
        total_amount: local.total_amount
      },
      transaction: local.transaction,
      accounting: local.accounting,
      anomaly: {
        score: local.anomaly_score,
        reasons: local.anomaly_reasons
      },
      caseRecord: caseRec || null
    };
  },

  // Cases (Audit Submissions)
  async submitCase(formData) {
    const invoiceId = formData.get('invoice_id');
    const finding = formData.get('user_finding');
    const user = this.getUser();

    const newCase = {
      id: `CASE-${invoiceId.replace('INV', '')}`,
      invoice_id: invoiceId,
      issue_type: 'Tax mismatch',
      priority: 'High',
      submitted_by_name: user ? user.name : 'Finance User',
      submitted_at: new Date().toISOString(),
      difference_amount: 1500,
      expected_tax: 9000,
      recorded_tax: 7500,
      user_finding: finding,
      evidence_file_name: 'corrected_invoice.pdf',
      evidence_file_size: '2.4 MB',
      status: 'Pending',
      auditor_notes: ''
    };

    // Update or insert
    const idx = TaxGuardStore.cases?.findIndex(c => c.invoice_id === invoiceId) ?? -1;
    if (idx >= 0) {
      TaxGuardStore.cases[idx] = newCase;
    } else if (TaxGuardStore.cases) {
      TaxGuardStore.cases.unshift(newCase);
    }

    // Add to audit log
    TaxGuardStore.auditLogs.unshift({
      timestamp: 'Just now',
      user: user ? user.name : 'Finance User',
      action: 'SUBMIT_CASE',
      entity: 'Case',
      description: `${user ? user.name : 'Finance User'} submitted ${invoiceId} for audit`
    });

    return { success: true, caseId: newCase.id };
  },

  async getCases(params = {}) {
    const { status = 'pending' } = params;
    const isPending = status.toLowerCase() === 'pending';
    const cases = TaxGuardStore.cases || [];
    const filtered = cases.filter(c => isPending ? c.status === 'Pending' : c.status === 'Resolved');

    return {
      pendingCount: cases.filter(c => c.status === 'Pending').length,
      resolvedCount: cases.filter(c => c.status === 'Resolved').length,
      cases: filtered
    };
  },

  async getCase(id) {
    const c = (TaxGuardStore.cases || []).find(x => x.id === id || x.invoice_id === id) || (TaxGuardStore.cases ? TaxGuardStore.cases[0] : null);
    return { caseRecord: c };
  },

  async approveCase(id, notes) {
    const c = (TaxGuardStore.cases || []).find(x => x.id === id);
    if (c) {
      c.status = 'Resolved';
      c.auditor_notes = notes || 'Approved & resolved';
    }
    const user = this.getUser();
    TaxGuardStore.auditLogs.unshift({
      timestamp: 'Just now',
      user: user ? user.name : 'Auditor',
      action: 'APPROVE_CASE',
      entity: 'Case',
      description: `${user ? user.name : 'Auditor'} approved and resolved ${c ? c.invoice_id : id}`
    });
    return { success: true };
  },

  async rejectCase(id, notes) {
    const c = (TaxGuardStore.cases || []).find(x => x.id === id);
    if (c) {
      c.status = 'Requires Action';
      c.auditor_notes = notes || 'Returned to user';
    }
    const user = this.getUser();
    TaxGuardStore.auditLogs.unshift({
      timestamp: 'Just now',
      user: user ? user.name : 'Auditor',
      action: 'REJECT_CASE',
      entity: 'Case',
      description: `${user ? user.name : 'Auditor'} returned ${c ? c.invoice_id : id} for action`
    });
    return { success: true };
  },

  // Admin
  async getAdminUsers() {
    return { users: TaxGuardStore.adminUsers };
  },

  async createAdminUser(userData) {
    const user = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: 'Active'
    };
    TaxGuardStore.adminUsers.push(user);
    return { success: true, user };
  },

  async toggleUserStatus(id) {
    const u = TaxGuardStore.adminUsers.find(x => x.id === id);
    if (u) {
      u.status = u.status === 'Active' ? 'Inactive' : 'Active';
    }
    return { success: true };
  },

  async getAdminStats() {
    return {
      totalRecords: 10000,
      openCases: TaxGuardStore.cases.filter(c => c.status === 'Pending').length,
      pendingAudits: TaxGuardStore.cases.filter(c => c.status === 'Pending').length,
      resolvedCases: TaxGuardStore.cases.filter(c => c.status === 'Resolved').length,
      totalUsers: TaxGuardStore.adminUsers.length
    };
  },

  // Audit Logs
  async getAuditLogs() {
    return { logs: TaxGuardStore.auditLogs };
  },

  // Reports
  async getReconciliationReport() {
    return {
      totalRecords: 10000,
      matched: 8720,
      issues: 842,
      duplicates: 230,
      unmatched: 208,
      taxDiscrepancies: 412
    };
  }
};

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
