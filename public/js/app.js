/**
 * TaxGuard - Precision Fintech Web Application
 * Vanilla HTML5 / CSS3 / JavaScript (Zero React, Zero Backend DB dependency)
 * Visual & Component Match to TaxGuard UI Design Mockup (media_1791044907279.jpg)
 */

let dashboardChartInstance = null;
let currentTab = 'all';
let currentPage = 1;
let currentSearch = '';
let currentStatusFilter = '';
let currentIssueFilter = '';
let auditorTab = 'pending';
let isSignupMode = false;

// Format Currency in INR ₹
function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// App Shell & Navigation (Matches Mockup Sidebars)
function renderAppShell() {
  const user = api.getUser();
  const sidebar = document.getElementById('sidebar');
  const topHeader = document.getElementById('top-header');
  const mainWrapper = document.getElementById('main-wrapper');

  if (!user || window.location.hash === '#login') {
    if (sidebar) sidebar.style.display = 'none';
    if (topHeader) topHeader.style.display = 'none';
    if (mainWrapper) mainWrapper.style.marginLeft = '0';
    return;
  }

  if (sidebar) sidebar.style.display = 'flex';
  if (topHeader) topHeader.style.display = 'flex';
  if (mainWrapper) mainWrapper.style.marginLeft = 'var(--sidebar-width)';

  // Navigation Items matching the exact mockup tabs
  let navItems = [];
  if (user.role === 'USER') {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid', route: 'dashboard' },
      { id: 'upload', label: 'Upload Data', icon: 'upload', route: 'upload' },
      { id: 'results', label: 'Reconciliation', icon: 'check-square', route: 'results' },
      { id: 'my-cases', label: 'My Cases', icon: 'folder', route: 'my-cases' },
      { id: 'reports', label: 'Reports', icon: 'bar-chart-2', route: 'reports' }
    ];
  } else if (user.role === 'AUDITOR') {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid', route: 'dashboard' },
      { id: 'audit-queue', label: 'Audit Queue', icon: 'inbox', route: 'audit-queue' },
      { id: 'resolved-cases', label: 'Resolved Cases', icon: 'check-circle', route: 'resolved-cases' },
      { id: 'reports', label: 'Reports', icon: 'bar-chart-2', route: 'reports' }
    ];
  } else if (user.role === 'ADMIN') {
    navItems = [
      { id: 'admin-dashboard', label: 'Dashboard', icon: 'grid', route: 'admin-dashboard' },
      { id: 'admin-users', label: 'Users', icon: 'users', route: 'admin-users' },
      { id: 'admin-tickets', label: 'Cases', icon: 'folder', route: 'admin-tickets' },
      { id: 'reports', label: 'Reports', icon: 'bar-chart-2', route: 'reports' },
      { id: 'audit-logs', label: 'Audit Logs', icon: 'clock', route: 'audit-logs' }
    ];
  }

  const navHtml = navItems.map(item => `
    <a class="nav-link" data-route="${item.route}" onclick="router.navigate('${item.route}')">
      <span class="nav-icon-box">${getNavIconSvg(item.icon)}</span>
      <span>${item.label}</span>
    </a>
  `).join('');

  document.getElementById('sidebar-nav').innerHTML = navHtml;

  // Header User Profile
  document.getElementById('header-user-name').textContent = user.name || 'User';
  document.getElementById('header-user-role').textContent = user.role || 'USER';
  document.getElementById('header-user-avatar').textContent = (user.name || 'U').charAt(0).toUpperCase();

  const currentBase = (window.location.hash || '').replace(/^#\/?/, '').split('/')[0];
  router.updateNavActiveState(currentBase);
}

function getNavIconSvg(icon) {
  const icons = {
    grid: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect></svg>`,
    upload: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>`,
    'check-square': `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    folder: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>`,
    'bar-chart-2': `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 20V10m-6 10V4m-6 16v-6"></path></svg>`,
    inbox: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4a2 2 0 01-2 1.5l-1 1.5H9l-1-1.5A2 2 0 016 13H2"></path></svg>`,
    'check-circle': `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    users: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`,
    clock: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9"></circle><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 3"></path></svg>`
  };
  return icons[icon] || icons['grid'];
}

// ==========================================
// 1. LOGIN & SIGN UP PAGE (Matches Mockup Screen 1)
// ==========================================
function renderLogin() {
  renderAppShell();
  const container = document.getElementById('page-content');
  container.innerHTML = `
    <div class="login-screen-wrap">
      <!-- Left Hero (Matches Mockup Screen 1) -->
      <div class="login-left-hero">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="logo-icon">TG</div>
          <div class="logo-text-wrap">
            <span class="logo-text">TaxGuard</span>
            <span class="logo-sub">Intelligent Tax Reconciliation</span>
          </div>
        </div>

        <div style="max-width: 440px;">
          <h1 style="font-size: 40px; line-height: 1.15; font-weight: 800; color: #0F172A; margin: 30px 0 16px; letter-spacing: -0.03em;">
            Automate.<br/>Detect.<br/>Ensure Compliance.
          </h1>
          <p style="font-size: 15px; color: #64748B; line-height: 1.6;">
            Reconcile your financial records with confidence using AI.
          </p>
        </div>

        <div style="font-size: 12px; color: #94A3B8;">
          © 2025 TaxGuard Enterprise
        </div>
      </div>

      <!-- Right Form Card (Matches Mockup Screen 1) -->
      <div class="login-right-form">
        <div class="login-box">
          <div class="login-tab-switcher">
            <button class="login-tab-btn ${!isSignupMode ? 'active' : ''}" onclick="toggleAuthMode(false)">Sign In</button>
            <button class="login-tab-btn ${isSignupMode ? 'active' : ''}" onclick="toggleAuthMode(true)">Create Account</button>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 22px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">
              ${!isSignupMode ? 'Sign in to your account' : 'Create an Account'}
            </h2>
          </div>

          <form id="auth-form">
            ${isSignupMode ? `
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="reg-name" class="form-control" placeholder="Enter your full name" required>
              </div>
            ` : ''}

            <!-- 1-2 Demo Inputs -->
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="auth-email" class="form-control" value="${!isSignupMode ? 'user@company.com' : ''}" placeholder="you@company.com" required>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div style="position:relative;">
                <input type="password" id="auth-password" class="form-control" value="${!isSignupMode ? 'password123' : ''}" placeholder="Enter your password" required>
                <span onclick="togglePasswordVisibility()" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--color-text-muted); font-size:13px;">👁</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Role</label>
              <select id="${isSignupMode ? 'reg-role' : 'auth-role'}" class="input-select" style="width:100%; height:40px; border-radius:6px; font-weight:500;">
                <option value="USER">User (Finance Specialist)</option>
                <option value="AUDITOR">Auditor (Compliance Reviewer)</option>
                <option value="ADMIN">Admin (System Operations)</option>
              </select>
            </div>

            ${!isSignupMode ? `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 13px;">
                <label style="display: flex; align-items: center; gap: 7px; cursor: pointer; color:#0F172A;">
                  <input type="checkbox" checked style="accent-color:#1E60F2;"> Remember me
                </label>
                <a style="color: #1E60F2; text-decoration: none; font-weight:500;" href="javascript:void(0)" onclick="showToast('Password reset link sent to your registered email.', 'info')">Forgot password?</a>
              </div>
            ` : ''}

            <button type="submit" id="btn-submit-auth" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 14.5px; font-weight: 600; border-radius: 8px;">
              ${!isSignupMode ? 'Sign In' : 'Create Account'}
            </button>

            <!-- 1-2 Demo Fill Shortcuts -->
            ${!isSignupMode ? `
              <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-top:16px; padding-top:14px; border-top:1px solid #F1F5F9; font-size:12px; color:var(--color-text-muted);">
                <span style="font-weight:500;">Demo:</span>
                <button type="button" class="btn btn-secondary btn-sm" style="padding:4px 10px; font-size:11.5px; border-radius:6px;" onclick="fillDemoInput('USER')">
                  User Demo
                </button>
                <button type="button" class="btn btn-secondary btn-sm" style="padding:4px 10px; font-size:11.5px; border-radius:6px;" onclick="fillDemoInput('AUDITOR')">
                  Auditor Demo
                </button>
              </div>
            ` : ''}
          </form>
        </div>
      </div>
    </div>
  `;

  document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const roleElem = document.getElementById(isSignupMode ? 'reg-role' : 'auth-role');
    const role = roleElem ? roleElem.value : 'USER';

    let name = 'User';
    if (isSignupMode) {
      name = document.getElementById('reg-name').value || (role === 'ADMIN' ? 'Admin' : role === 'AUDITOR' ? 'Auditor' : 'User');
    } else {
      name = role === 'ADMIN' ? 'Admin' : role === 'AUDITOR' ? 'Auditor' : 'User';
    }

    const user = { id: `usr-${Date.now()}`, name, email, role, status: 'ACTIVE' };
    api.setUser(user);
    showToast(`Signed in successfully as ${name} (${role})`, 'success');
    renderAppShell();

    // Redirect to respective dashboard as per choice
    if (role === 'ADMIN') router.navigate('admin-dashboard');
    else if (role === 'AUDITOR') router.navigate('audit-queue');
    else router.navigate('dashboard');
  });
}

// 1-2 Demo Input Helper
function fillDemoInput(role) {
  const emailInput = document.getElementById('auth-email');
  const passInput = document.getElementById('auth-password');
  const roleSelect = document.getElementById(isSignupMode ? 'reg-role' : 'auth-role');

  if (role === 'USER') {
    if (emailInput) emailInput.value = 'user@company.com';
    if (passInput) passInput.value = 'password123';
    if (roleSelect) roleSelect.value = 'USER';
    showToast('Loaded User demo credentials', 'info');
  } else if (role === 'AUDITOR') {
    if (emailInput) emailInput.value = 'auditor@company.com';
    if (passInput) passInput.value = 'password123';
    if (roleSelect) roleSelect.value = 'AUDITOR';
    showToast('Loaded Auditor demo credentials', 'info');
  }
}

function toggleAuthMode(toSignup) {
  isSignupMode = toSignup;
  renderLogin();
}

function directRoleLogin(role) {
  let name = 'User';
  let email = 'user@company.com';

  if (role === 'AUDITOR') {
    name = 'Auditor';
    email = 'auditor@company.com';
  } else if (role === 'ADMIN') {
    name = 'Admin';
    email = 'admin@company.com';
  }

  const user = { id: `usr-${role.toLowerCase()}`, name, email, role, status: 'ACTIVE' };
  api.setUser(user);
  showToast(`Switched workspace role to ${name} (${role})`, 'success');
  renderAppShell();

  if (role === 'ADMIN') router.navigate('admin-dashboard');
  else if (role === 'AUDITOR') router.navigate('audit-queue');
  else router.navigate('dashboard');
}

function togglePasswordVisibility() {
  const p = document.getElementById('auth-password');
  if (p) p.type = p.type === 'password' ? 'text' : 'password';
}

function toggleRoleSwitchModal() {
  let modal = document.getElementById('modal-role-switch');
  if (modal) {
    modal.remove();
    return;
  }

  modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-role-switch';
  modal.innerHTML = `
    <div class="modal-dialog" style="max-width:390px;">
      <div class="modal-header">
        <h3 class="modal-title">Switch Active Role</h3>
        <button class="btn-close" onclick="document.getElementById('modal-role-switch').remove()">✕</button>
      </div>
      <p style="font-size:12.5px; color:var(--color-text-muted); margin-bottom:16px;">
        Select an authorized role to switch workspaces:
      </p>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div class="role-switch-btn" onclick="directRoleLogin('USER'); document.getElementById('modal-role-switch').remove();">
          <div style="text-align:left;">
            <div style="font-size:13px; font-weight:700; color:var(--color-primary);">💼 User (Finance)</div>
            <div style="font-size:11px; color:var(--color-text-muted);">Upload files, view mismatches, raise appeal tickets</div>
          </div>
          <span style="font-size:12px; font-weight:600; color:var(--color-accent);">Switch →</span>
        </div>
        <div class="role-switch-btn" onclick="directRoleLogin('AUDITOR'); document.getElementById('modal-role-switch').remove();">
          <div style="text-align:left;">
            <div style="font-size:13px; font-weight:700; color:var(--color-primary);">⚖️ Auditor (Compliance)</div>
            <div style="font-size:11px; color:var(--color-text-muted);">Review discrepancies, verify evidence, resolve tickets</div>
          </div>
          <span style="font-size:12px; font-weight:600; color:var(--color-accent);">Switch →</span>
        </div>
        <div class="role-switch-btn" onclick="directRoleLogin('ADMIN'); document.getElementById('modal-role-switch').remove();">
          <div style="text-align:left;">
            <div style="font-size:13px; font-weight:700; color:var(--color-primary);">🛡️ Admin (System)</div>
            <div style="font-size:11px; color:var(--color-text-muted);">System governance, user control, auto-close tickets</div>
          </div>
          <span style="font-size:12px; font-weight:600; color:var(--color-accent);">Switch →</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// ==========================================
// 2. USER DASHBOARD (Matches Mockup Screen 2)
// ==========================================
async function renderDashboard() {
  renderAppShell();
  const user = api.getUser() || { name: 'User' };
  const container = document.getElementById('page-content');
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Good morning, ${escapeHtml(user.name)} 👋</h1>
          <p class="page-subtitle">Here's your reconciliation overview for this month.</p>
        </div>
        <div>
          <button class="btn btn-primary" onclick="router.navigate('upload')">
            + Upload Data
          </button>
        </div>
      </div>

      <!-- 4 Stat Cards in a row (Matches Mockup Screen 2) -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-value">10,000</span>
            <span class="kpi-label">Total Records</span>
          </div>
          <div class="kpi-icon-wrap icon-blue">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-value">8,720</span>
            <span class="kpi-label">Matched</span>
            <span class="kpi-badge success">87%</span>
          </div>
          <div class="kpi-icon-wrap icon-green">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-value">842</span>
            <span class="kpi-label">Issues</span>
            <span class="kpi-badge danger">8%</span>
          </div>
          <div class="kpi-icon-wrap icon-red">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-value">438</span>
            <span class="kpi-label">High Priority</span>
            <span class="kpi-badge warning">4%</span>
          </div>
          <div class="kpi-icon-wrap icon-orange">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
        </div>
      </div>

      <!-- Donut Chart & Recent Discrepancies Table (Matches Mockup Screen 2) -->
      <div class="dashboard-split">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Reconciliation Status</h3>
          </div>
          <div class="chart-container-wrap">
            <div class="chart-canvas-box">
              <canvas id="reconciliationChart"></canvas>
              <div class="chart-center-label">
                <div class="chart-center-val">10,000</div>
                <div class="chart-center-sub">Records</div>
              </div>
            </div>
            <div class="chart-legend-list">
              <div class="legend-item">
                <div><span class="legend-color-dot" style="background:#16A34A;"></span>Matched</div>
                <span class="legend-pct">87%</span>
              </div>
              <div class="legend-item">
                <div><span class="legend-color-dot" style="background:#DC2626;"></span>Issues</div>
                <span class="legend-pct">8%</span>
              </div>
              <div class="legend-item">
                <div><span class="legend-color-dot" style="background:#D97706;"></span>Duplicates</div>
                <span class="legend-pct">3%</span>
              </div>
              <div class="legend-item">
                <div><span class="legend-color-dot" style="background:#1E60F2;"></span>Unmatched</div>
                <span class="legend-pct">2%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recent Discrepancies</h3>
            <a class="card-link" onclick="router.navigate('results')">View all</a>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Issue</th>
                  <th>Difference</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>INV1023</strong></td>
                  <td>Tax mismatch</td>
                  <td style="font-weight:600; color:var(--color-primary);">₹1,500</td>
                  <td><span class="priority-badge priority-high">▲ High</span></td>
                  <td><a class="btn-table-view" onclick="router.navigate('discrepancy/INV1023')">View</a></td>
                </tr>
                <tr>
                  <td><strong>INV1042</strong></td>
                  <td>Payment mismatch</td>
                  <td style="font-weight:600; color:var(--color-primary);">₹3,000</td>
                  <td><span class="priority-badge priority-high">▲ High</span></td>
                  <td><a class="btn-table-view" onclick="router.navigate('discrepancy/INV1042')">View</a></td>
                </tr>
                <tr>
                  <td><strong>INV1098</strong></td>
                  <td>Duplicate</td>
                  <td style="font-weight:600; color:var(--color-primary);">₹25,000</td>
                  <td><span class="priority-badge priority-medium">● Medium</span></td>
                  <td><a class="btn-table-view" onclick="router.navigate('discrepancy/INV1098')">View</a></td>
                </tr>
                <tr>
                  <td><strong>INV1102</strong></td>
                  <td>Amount mismatch</td>
                  <td style="font-weight:600; color:var(--color-primary);">₹4,200</td>
                  <td><span class="priority-badge priority-medium">● Medium</span></td>
                  <td><a class="btn-table-view" onclick="router.navigate('discrepancy/INV1102')">View</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  initDashboardDonutChart({ matched: 87, issues: 8, duplicates: 3, unmatched: 2 });
}

function initDashboardDonutChart(p) {
  const ctx = document.getElementById('reconciliationChart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (dashboardChartInstance) dashboardChartInstance.destroy();

  dashboardChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Matched', 'Issues', 'Duplicates', 'Unmatched'],
      datasets: [{
        data: [p.matched, p.issues, p.duplicates, p.unmatched],
        backgroundColor: ['#16A34A', '#DC2626', '#D97706', '#1E60F2'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 3
      }]
    },
    options: {
      cutout: '72%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => ` ${item.label}: ${item.raw}%`
          }
        }
      }
    }
  });
}

// ==========================================
// 3. UPLOAD FINANCIAL DATA (Matches Mockup Screen 3)
// ==========================================
function renderUpload() {
  renderAppShell();
  const container = document.getElementById('page-content');
  container.innerHTML = `
    <div class="page-container" style="max-width: 860px;">
      <div class="page-header" style="margin-bottom: 20px;">
        <div>
          <h1 class="page-title">Upload Financial Data</h1>
          <p class="page-subtitle">Upload your invoices, transactions and accounting records to start reconciliation.</p>
        </div>
      </div>

      <!-- Dropzone (Matches Mockup Screen 3) -->
      <div class="upload-card-zone" id="drop-zone" onclick="document.getElementById('file-input-multi').click()">
        <input type="file" id="file-input-multi" multiple accept=".csv" style="display:none;" onchange="showToast('Uploaded: ' + this.files[0].name, 'info')">
        <div class="upload-icon-circle">
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        </div>
        <div style="font-size:15px; font-weight:600; color:var(--color-primary); margin-bottom:4px;">
          Drag & drop CSV files here
        </div>
        <div style="font-size:13px; color:var(--color-text-muted); margin-bottom:12px;">or</div>
        <button type="button" class="btn btn-secondary btn-sm" style="color:#1E60F2; font-weight:600;">Browse Files</button>
        <div style="font-size:11.5px; color:var(--color-text-light); margin-top:14px;">Supported format: CSV (Max size: 50MB)</div>
      </div>

      <!-- Uploaded Files List (Matches Mockup Screen 3) -->
      <div class="file-cards-list">
        <div class="file-status-card">
          <div class="file-info">
            <div class="file-icon-box">📊</div>
            <div>
              <div class="file-name">invoices.csv</div>
              <div class="file-size">2.4 MB</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="color:#16A34A; font-weight:700; font-size:16px;">✓</span>
            <span style="color:#94A3B8; cursor:pointer;" onclick="showToast('File removed', 'info')">🗑</span>
          </div>
        </div>

        <div class="file-status-card">
          <div class="file-info">
            <div class="file-icon-box">📊</div>
            <div>
              <div class="file-name">transactions.csv</div>
              <div class="file-size">3.1 MB</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="color:#16A34A; font-weight:700; font-size:16px;">✓</span>
            <span style="color:#94A3B8; cursor:pointer;" onclick="showToast('File removed', 'info')">🗑</span>
          </div>
        </div>

        <div class="file-status-card">
          <div class="file-info">
            <div class="file-icon-box">📊</div>
            <div>
              <div class="file-name">accounting_records.csv</div>
              <div class="file-size">1.8 MB</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="color:#16A34A; font-weight:700; font-size:16px;">✓</span>
            <span style="color:#94A3B8; cursor:pointer;" onclick="showToast('File removed', 'info')">🗑</span>
          </div>
        </div>
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; margin-top:20px;">
        <button type="button" class="btn btn-secondary" onclick="handleSampleDataLoad()">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Load Sample Financial Records
        </button>

        <button type="button" class="btn btn-primary" style="padding:11px 26px; font-size:13.5px;" onclick="router.navigate('processing')">
          Analyze Data →
        </button>
      </div>
    </div>
  `;
}

function handleSampleDataLoad() {
  showToast('10,000 financial records loaded and ready for analysis.', 'success');
  setTimeout(() => router.navigate('processing'), 400);
}

// ==========================================
// 4. PROCESSING SCREEN (Matches Mockup Screen 4)
// ==========================================
function renderProcessing() {
  renderAppShell();
  const container = document.getElementById('page-content');
  container.innerHTML = `
    <div class="page-container" style="max-width: 680px; text-align: left;">
      <h1 class="page-title" style="font-size:24px; margin-bottom:6px;">Analyzing Your Data</h1>
      <p class="page-subtitle" style="margin-bottom: 24px;">This may take a few minutes. Please don't close this window.</p>

      <div class="stepper-container">
        <div class="stepper-list">
          <div class="step-item" id="p-1">
            <div class="step-indicator done">✓</div>
            <div class="step-content">
              <div class="step-title">Validating records</div>
              <div class="step-desc">Checking file format and data structure...</div>
            </div>
          </div>
          <div class="step-item" id="p-2">
            <div class="step-indicator done">✓</div>
            <div class="step-content">
              <div class="step-title">Matching transactions</div>
              <div class="step-desc">Reconciling invoices, payments and accounting records...</div>
            </div>
          </div>
          <div class="step-item" id="p-3">
            <div class="step-indicator done">✓</div>
            <div class="step-content">
              <div class="step-title">Checking duplicates</div>
              <div class="step-desc">Identifying potential duplicate records...</div>
            </div>
          </div>
          <div class="step-item" id="p-4">
            <div class="step-indicator active">◉</div>
            <div class="step-content">
              <div class="step-title">Verifying tax calculations</div>
              <div class="step-desc">Checking applicable tax rates and amounts...</div>
            </div>
          </div>
          <div class="step-item" id="p-5">
            <div class="step-indicator pending">○</div>
            <div class="step-content">
              <div class="step-title">Detecting anomalies</div>
              <div class="step-desc">Analyzing unusual transaction patterns...</div>
            </div>
          </div>
          <div class="step-item" id="p-6">
            <div class="step-indicator pending">○</div>
            <div class="step-content">
              <div class="step-title">Generating summary</div>
              <div class="step-desc">Preparing final results...</div>
            </div>
          </div>
        </div>

        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" id="proc-fill" style="width: 70%;"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--color-text-muted);">
          <span id="proc-status">Processing...</span>
          <span id="proc-pct">70%</span>
        </div>
      </div>
    </div>
  `;

  let pct = 70;
  const interval = setInterval(() => {
    pct += 10;
    if (pct === 80) {
      document.querySelector('#p-5 .step-indicator').className = 'step-indicator active';
      document.querySelector('#p-5 .step-indicator').textContent = '◉';
    } else if (pct === 90) {
      document.querySelector('#p-4 .step-indicator').className = 'step-indicator done';
      document.querySelector('#p-4 .step-indicator').textContent = '✓';
      document.querySelector('#p-6 .step-indicator').className = 'step-indicator active';
      document.querySelector('#p-6 .step-indicator').textContent = '◉';
    } else if (pct >= 100) {
      clearInterval(interval);
      document.querySelector('#p-5 .step-indicator').className = 'step-indicator done';
      document.querySelector('#p-5 .step-indicator').textContent = '✓';
      document.querySelector('#p-6 .step-indicator').className = 'step-indicator done';
      document.querySelector('#p-6 .step-indicator').textContent = '✓';

      document.getElementById('proc-fill').style.width = '100%';
      document.getElementById('proc-pct').textContent = '100%';
      document.getElementById('proc-status').textContent = 'Complete!';

      showToast('10,000 records analyzed. 842 discrepancies found.', 'success');
      setTimeout(() => router.navigate('results'), 500);
    }
    const fill = document.getElementById('proc-fill');
    if (fill && pct < 100) {
      fill.style.width = pct + '%';
      document.getElementById('proc-pct').textContent = pct + '%';
    }
  }, 350);
}

// ==========================================
// 5. RECONCILIATION RESULTS (Matches Mockup Screen 5)
// ==========================================
function renderResults() {
  renderAppShell();
  const container = document.getElementById('page-content');
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Reconciliation Results</h1>
          <p class="page-subtitle">10,000 records analyzed &nbsp;|&nbsp; 842 discrepancies found</p>
        </div>
      </div>

      <!-- Filter Tabs (Matches Mockup Screen 5) -->
      <div class="tabs-nav">
        <button class="tab-btn ${currentTab === 'all' ? 'active' : ''}" onclick="switchResultsTab('all')">
          All <span class="tab-count">(10,000)</span>
        </button>
        <button class="tab-btn ${currentTab === 'matched' ? 'active' : ''}" onclick="switchResultsTab('matched')">
          ✓ Matched <span class="tab-count">(8,720)</span>
        </button>
        <button class="tab-btn ${currentTab === 'issues' ? 'active' : ''}" onclick="switchResultsTab('issues')">
          ▲ Issues <span class="tab-count">(842)</span>
        </button>
        <button class="tab-btn ${currentTab === 'duplicates' ? 'active' : ''}" onclick="switchResultsTab('duplicates')">
          ▲ Duplicates <span class="tab-count">(230)</span>
        </button>
      </div>

      <!-- Filter Controls -->
      <div class="filter-bar">
        <div class="filter-inputs">
          <div class="search-box">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
            <input type="text" id="res-search" placeholder="Search by invoice, merchant or amount..." value="${escapeHtml(currentSearch)}" oninput="debounceFilter(this.value)">
          </div>

          <select class="input-select" onchange="currentStatusFilter=this.value; renderResultsTable();">
            <option value="">Status: All</option>
            <option value="Issue" ${currentStatusFilter === 'Issue' ? 'selected' : ''}>Issue</option>
            <option value="MATCHED" ${currentStatusFilter === 'MATCHED' ? 'selected' : ''}>Matched</option>
            <option value="Duplicate" ${currentStatusFilter === 'Duplicate' ? 'selected' : ''}>Duplicate</option>
          </select>

          <select class="input-select" onchange="currentIssueFilter=this.value; renderResultsTable();">
            <option value="">Issue Type: All</option>
            <option value="Tax mismatch" ${currentIssueFilter === 'Tax mismatch' ? 'selected' : ''}>Tax mismatch</option>
            <option value="Payment mismatch" ${currentIssueFilter === 'Payment mismatch' ? 'selected' : ''}>Payment mismatch</option>
            <option value="Duplicate" ${currentIssueFilter === 'Duplicate' ? 'selected' : ''}>Duplicate</option>
            <option value="Date mismatch" ${currentIssueFilter === 'Date mismatch' ? 'selected' : ''}>Date mismatch</option>
          </select>
        </div>
      </div>

      <!-- Table (Matches Mockup Screen 5) -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Merchant</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Issue</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="res-table-body">
            <!-- Rendered by renderResultsTable -->
          </tbody>
        </table>
      </div>

      <div class="pagination-wrapper">
        <span>Showing 1–6 of 842 results</span>
        <div class="pagination-controls">
          <button class="page-btn">‹</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <span style="display:flex; align-items:center; padding:0 4px; font-size:12px; color:var(--color-text-muted);">...</span>
          <button class="page-btn">141</button>
          <button class="page-btn">›</button>
        </div>
      </div>
    </div>
  `;

  renderResultsTable();
}

function switchResultsTab(tab) {
  currentTab = tab;
  renderResults();
}

function debounceFilter(val) {
  currentSearch = val;
  renderResultsTable();
}

function renderResultsTable() {
  const tbody = document.getElementById('res-table-body');
  if (!tbody) return;

  let items = TaxGuardStore.discrepancies;

  if (currentTab === 'matched') {
    items = items.filter(d => d.status === 'MATCHED');
  } else if (currentTab === 'issues') {
    items = items.filter(d => d.status !== 'MATCHED' && d.issue_type !== 'Duplicate');
  } else if (currentTab === 'duplicates') {
    items = items.filter(d => d.issue_type === 'Duplicate');
  }

  if (currentStatusFilter) {
    items = items.filter(d => currentStatusFilter === 'MATCHED' ? d.status === 'MATCHED' : (d.issue_type && d.issue_type.includes(currentStatusFilter)));
  }

  if (currentIssueFilter) {
    items = items.filter(d => d.issue_type === currentIssueFilter);
  }

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    items = items.filter(d =>
      d.invoice_id.toLowerCase().includes(q) ||
      (d.merchant_name && d.merchant_name.toLowerCase().includes(q)) ||
      String(d.amount).includes(q)
    );
  }

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--color-text-muted);">No records found matching current criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(item => {
    const isMatched = item.status === 'MATCHED';
    const isDup = item.issue_type === 'Duplicate';

    return `
      <tr>
        <td><strong>${escapeHtml(item.invoice_id)}</strong></td>
        <td>${formatDate(item.invoice_date)}</td>
        <td>${escapeHtml(item.merchant_name)}</td>
        <td style="font-weight:600;">${formatINR(item.amount)}</td>
        <td>
          <span class="badge ${isMatched ? 'badge-matched' : isDup ? 'badge-duplicate' : 'badge-issue'}">
            ${isMatched ? '✓ Matched' : isDup ? '▲ Duplicate' : '▲ Issue'}
          </span>
        </td>
        <td>${item.issue_type ? escapeHtml(item.issue_type) : '—'}</td>
        <td>
          <a class="btn-table-view" onclick="router.navigate('discrepancy/${encodeURIComponent(item.invoice_id)}')">
            View
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 6. DISCREPANCY DETAILS & INVESTIGATION (Matches Mockup Screen 6)
// ==========================================
function renderDiscrepancy(params) {
  renderAppShell();
  const invoiceId = params && params.id ? decodeURIComponent(params.id) : 'INV1023';
  const container = document.getElementById('page-content');

  const disc = TaxGuardStore.discrepancies.find(d => d.invoice_id === invoiceId) || TaxGuardStore.discrepancies[0];
  const activeTicket = TaxGuardStore.tickets.find(t => t.invoice_id === disc.invoice_id);

  const isTicketPending = activeTicket && activeTicket.status === 'PENDING_AUDIT';
  const isTicketResolved = activeTicket && activeTicket.status === 'RESOLVED';
  const isTicketClosed = activeTicket && activeTicket.status.startsWith('CLOSED');

  container.innerHTML = `
    <div class="page-container" style="max-width: 980px;">
      <!-- Back Link -->
      <a style="display:inline-flex; align-items:center; gap:6px; color:#1E60F2; font-weight:600; font-size:13px; text-decoration:none; margin-bottom:16px; cursor:pointer;" onclick="router.navigate('results')">
        ← Back to Results
      </a>

      <!-- Header with Badges (Matches Mockup Screen 6) -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
        <div>
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
            <h1 class="page-title" style="font-size:24px; margin:0;">${escapeHtml(disc.invoice_id)}</h1>
            ${disc.issue_type ? `<span class="badge badge-issue">${escapeHtml(disc.issue_type)}</span>` : ''}
            ${disc.priority ? `<span class="badge" style="background:#FEE2E2; color:#DC2626; border:none;">High-Priority</span>` : ''}
          </div>
          <p class="page-subtitle">
            Invoice Date: ${formatDate(disc.invoice_date)} &nbsp;|&nbsp; Merchant: ${escapeHtml(disc.merchant_name)}
          </p>
        </div>
        <div>
          <span style="font-size:12.5px; font-weight:600; color:var(--color-text-muted); background:white; border:1px solid var(--color-border); padding:6px 12px; border-radius:6px;">
            Status: ${activeTicket ? escapeHtml(activeTicket.status) : 'Open'} ▾
          </span>
        </div>
      </div>

      <!-- 3 Comparative Cards (Matches Mockup Screen 6) -->
      <div class="comparison-cards-grid">
        <div class="record-box">
          <div class="record-box-header">Invoice Record</div>
          <div class="record-field-row">
            <span class="record-field-label">Total Amount</span>
            <span class="record-field-val">${formatINR(disc.amount)}</span>
          </div>
          <div class="record-field-row">
            <span class="record-field-label">GST Amount</span>
            <span class="record-field-val">${formatINR(disc.recorded_tax || 7500)}</span>
          </div>
        </div>

        <div class="record-box">
          <div class="record-box-header">Transaction Record</div>
          <div class="record-field-row">
            <span class="record-field-label">Total Amount</span>
            <span class="record-field-val">${formatINR(disc.transaction ? disc.transaction.amount : disc.amount)}</span>
          </div>
          <div class="record-field-row">
            <span class="record-field-label">Payment Date</span>
            <span class="record-field-val">${formatDate(disc.transaction ? disc.transaction.payment_date : disc.invoice_date)}</span>
          </div>
        </div>

        <div class="record-box">
          <div class="record-box-header">Accounting Record</div>
          <div class="record-field-row">
            <span class="record-field-label">Total Amount</span>
            <span class="record-field-val">${formatINR(disc.accounting ? disc.accounting.recorded_total_amount : disc.amount)}</span>
          </div>
          <div class="record-field-row">
            <span class="record-field-label">GST Amount</span>
            <span class="record-field-val">${formatINR(disc.expected_tax || 9000)}</span>
          </div>
        </div>
      </div>

      <!-- Breakdown 2 Boxes (Matches Mockup Screen 6) -->
      <div class="discrepancy-breakdown-box">
        <div class="detected-box">
          <h4 style="font-size:14px; font-weight:700; color:var(--color-primary); margin-bottom:14px;">Detected Discrepancy</h4>
          <div class="diff-row">
            <span style="color:var(--color-text-muted);">Expected Tax</span>
            <span style="font-weight:600;">${formatINR(disc.expected_tax || 9000)}</span>
          </div>
          <div class="diff-row">
            <span style="color:var(--color-text-muted);">Recorded Tax</span>
            <span style="font-weight:600;">${formatINR(disc.recorded_tax || 7500)}</span>
          </div>
          <div class="diff-row difference">
            <span>Difference</span>
            <span>${formatINR(disc.difference_amount || 1500)}</span>
          </div>
        </div>

        <div class="why-flagged-box">
          <h4 style="font-size:14px; font-weight:700; color:var(--color-primary); margin-bottom:14px;">Why was this flagged?</h4>
          <div style="font-size:12.5px; line-height:1.6; color:#475569;">
            <div>• Taxable amount: <strong>${formatINR(disc.taxable_amount || 50000)}</strong></div>
            <div>• Applicable tax rate: <strong>${disc.tax_rate || 18}%</strong></div>
            <div>• Expected tax: <strong>${formatINR(disc.expected_tax || 9000)}</strong></div>
            <div>• Recorded tax: <strong>${formatINR(disc.recorded_tax || 7500)}</strong></div>
            <div style="margin-top:8px; color:var(--color-text-muted);">
              — The recorded tax differs from the expected tax calculation based on the applicable rate.
            </div>
          </div>
        </div>
      </div>

      <!-- Investigation & Appeal Section (Matches Mockup Screen 6) -->
      <div class="card">
        ${activeTicket ? `
          <!-- Ticket Status & Resolution -->
          <div style="margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">Appeal Ticket #${escapeHtml(activeTicket.id)}</h4>
              <span class="badge ${isTicketClosed ? 'badge-matched' : isTicketResolved ? 'badge-resolved' : 'badge-pending'}">
                ${isTicketClosed ? '✓ ' + escapeHtml(activeTicket.status) : isTicketResolved ? 'Resolution Proposed' : 'Under Review'}
              </span>
            </div>

            <div style="background:#F8FAFC; border:1px solid var(--color-border); border-radius:8px; padding:14px; margin-bottom:14px;">
              <div style="font-size:12px; font-weight:600; color:var(--color-primary); margin-bottom:4px;">Your Finding / Explanation:</div>
              <p style="font-size:12.5px; color:var(--color-text-muted); line-height:1.5;">"${escapeHtml(activeTicket.user_explanation)}"</p>
            </div>

            ${activeTicket.auditor_notes ? `
              <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:14px; margin-bottom:14px;">
                <div style="font-size:12px; font-weight:600; color:#1E40AF; margin-bottom:4px;">Auditor Resolution Assessment:</div>
                <p style="font-size:12.5px; color:#1E40AF; line-height:1.5;">"${escapeHtml(activeTicket.auditor_notes)}"</p>
              </div>
            ` : ''}

            ${isTicketResolved ? `
              <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:16px;">
                <button class="btn btn-success" onclick="handleUserCloseTicket('${activeTicket.id}')">
                  ✓ Close Ticket / Accept Resolution
                </button>
              </div>
            ` : isTicketClosed ? `
              <div style="padding:10px; background:#DCFCE7; border-radius:6px; color:#16A34A; font-weight:600; font-size:12.5px; text-align:center;">
                ✓ Ticket resolved and closed (${escapeHtml(activeTicket.closed_by)} at ${escapeHtml(activeTicket.closed_at)})
              </div>
            ` : `
              <div style="font-size:12px; color:#2563EB; background:#EFF6FF; padding:10px; border-radius:6px;">
                ⏳ This appeal is currently under review in the compliance auditor queue.
              </div>
            `}
          </div>
        ` : `
          <!-- New Appeal Form (Matches Mockup Screen 6) -->
          <form id="form-discrepancy-appeal">
            <div style="display:grid; grid-template-columns: 1.3fr 1fr; gap:20px;">
              <div>
                <label class="form-label">Your Finding</label>
                <div style="position:relative;">
                  <textarea id="finding-text" class="form-control" rows="4" placeholder="Enter your explanation for this discrepancy..." required style="resize:none;">Incorrect tax value entered in the accounting record. The applicable rate should be 18% as per GST guidelines.</textarea>
                  <span style="position:absolute; bottom:8px; right:10px; font-size:11px; color:#94A3B8;">0/500</span>
                </div>
              </div>

              <div style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <label class="form-label">Supporting Evidence (Optional)</label>
                  <input type="file" id="evidence-file" style="display:none;" onchange="showToast('Attached: ' + this.files[0].name, 'info')">
                  <button type="button" class="btn btn-secondary" style="width:100%; border:1px dashed #CBD5E1; padding:10px;" onclick="document.getElementById('evidence-file').click()">
                    📎 Upload File (PDF/CSV)
                  </button>
                </div>

                <button type="submit" class="btn btn-primary" style="width:100%; padding:11px; font-size:13.5px;">
                  Submit for Audit
                </button>
              </div>
            </div>
          </form>
        `}
      </div>
    </div>
  `;

  const form = document.getElementById('form-discrepancy-appeal');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const expl = document.getElementById('finding-text').value;
      const user = api.getUser() || { name: 'User' };

      const newTkt = {
        id: `TKT-${disc.invoice_id.replace('INV', '')}`,
        invoice_id: disc.invoice_id,
        issue_type: disc.issue_type || 'Tax mismatch',
        priority: disc.priority || 'High',
        difference_amount: disc.difference_amount || 1500,
        expected_tax: disc.expected_tax || 9000,
        recorded_tax: disc.recorded_tax || 7500,
        submitted_by: user.name,
        submitted_at: 'Just now',
        user_explanation: expl,
        evidence_file_name: 'corrected_invoice.pdf',
        evidence_file_size: '2.4 MB',
        status: 'PENDING_AUDIT',
        auditor_notes: '',
        resolved_at: null,
        resolved_by: null,
        auto_close_interval_hours: 48,
        closed_by: null,
        closed_at: null
      };

      TaxGuardStore.tickets.unshift(newTkt);
      TaxGuardStore.auditLogs.unshift({
        timestamp: 'Just now',
        user: user.name,
        action: 'SUBMIT_FOR_AUDIT',
        entity: `Ticket #${newTkt.id}`,
        description: `${user.name} submitted ${disc.invoice_id} for audit review`
      });

      showToast(`Submitted for Audit! Ticket #${newTkt.id} created.`, 'success');
      setTimeout(() => renderDiscrepancy({ id: disc.invoice_id }), 300);
    });
  }
}

// User closes resolved ticket
function handleUserCloseTicket(ticketId) {
  const t = TaxGuardStore.tickets.find(x => x.id === ticketId);
  if (t) {
    t.status = 'CLOSED_BY_USER';
    t.closed_by = 'User';
    t.closed_at = 'Just now';

    TaxGuardStore.auditLogs.unshift({
      timestamp: 'Just now',
      user: 'User',
      action: 'CLOSE_TICKET',
      entity: `Ticket #${ticketId}`,
      description: `User accepted resolution and closed Ticket #${ticketId}`
    });

    showToast(`✓ Ticket #${ticketId} closed.`, 'success');
    if ((window.location.hash || '').includes('my-cases')) {
      renderMyCases();
    } else {
      renderDiscrepancy({ id: t.invoice_id });
    }
  }
}

// ==========================================
// 7. AUDITOR DASHBOARD (Matches Mockup Screen 7)
// ==========================================
function renderAuditorQueue() {
  renderAppShell();
  const container = document.getElementById('page-content');

  const pending = TaxGuardStore.tickets.filter(t => t.status === 'PENDING_AUDIT');
  const resolved = TaxGuardStore.tickets.filter(t => t.status !== 'PENDING_AUDIT');
  const activeList = auditorTab === 'pending' ? pending : resolved;

  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Audit Queue</h1>
          <p class="page-subtitle">Review and verify cases submitted by users.</p>
        </div>
      </div>

      <!-- Tabs (Matches Mockup Screen 7) -->
      <div class="tabs-nav">
        <button class="tab-btn ${auditorTab === 'pending' ? 'active' : ''}" onclick="auditorTab='pending'; renderAuditorQueue();">
          Pending (${pending.length})
        </button>
        <button class="tab-btn ${auditorTab === 'resolved' ? 'active' : ''}" onclick="auditorTab='resolved'; renderAuditorQueue();">
          Resolved (${resolved.length})
        </button>
      </div>

      <!-- Table (Matches Mockup Screen 7) -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Invoice</th>
              <th>Issue</th>
              <th>Submitted By</th>
              <th>Date</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${activeList.length === 0 ? `
              <tr><td colspan="7" style="text-align:center; padding:30px; color:var(--color-text-muted);">No cases in this queue.</td></tr>
            ` : activeList.map(t => `
              <tr>
                <td><strong>#${escapeHtml(t.id.replace('TKT-', ''))}</strong></td>
                <td><strong>${escapeHtml(t.invoice_id)}</strong></td>
                <td>${escapeHtml(t.issue_type)}</td>
                <td>${escapeHtml(t.submitted_by)}</td>
                <td>${escapeHtml(t.submitted_at)}</td>
                <td>
                  <span class="priority-badge ${t.priority === 'High' ? 'priority-high' : t.priority === 'Medium' ? 'priority-medium' : 'priority-low'}">
                    ${t.priority === 'High' ? '▲ High' : t.priority === 'Medium' ? '● Medium' : '● Low'}
                  </span>
                </td>
                <td>
                  <a class="btn-table-view" onclick="router.navigate('case-review/${encodeURIComponent(t.id)}')">
                    Review
                  </a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================
// 8. AUDITOR REVIEW (Matches Mockup Screen 8)
// ==========================================
function renderCaseReview(params) {
  renderAppShell();
  const ticketId = params && params.id ? decodeURIComponent(params.id) : TaxGuardStore.tickets[0].id;
  const container = document.getElementById('page-content');

  const tkt = TaxGuardStore.tickets.find(t => t.id === ticketId) || TaxGuardStore.tickets[0];

  container.innerHTML = `
    <div class="page-container" style="max-width: 860px;">
      <!-- Back Link -->
      <a style="display:inline-flex; align-items:center; gap:6px; color:#1E60F2; font-weight:600; font-size:13px; text-decoration:none; margin-bottom:16px; cursor:pointer;" onclick="router.navigate('audit-queue')">
        ← Back to Audit Queue
      </a>

      <!-- Header (Matches Mockup Screen 8) -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
        <div>
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
            <h1 class="page-title" style="font-size:24px; margin:0;">Case #${escapeHtml(tkt.id.replace('TKT-', ''))}</h1>
            <span class="badge badge-issue">${escapeHtml(tkt.issue_type)}</span>
            <span class="badge" style="background:#FEE2E2; color:#DC2626; border:none;">High-Priority</span>
          </div>
          <p class="page-subtitle">
            Submitted by: ${escapeHtml(tkt.submitted_by)} &nbsp;|&nbsp; ${escapeHtml(tkt.submitted_at)}
          </p>
        </div>
        <div>
          <span style="font-size:12.5px; font-weight:600; color:var(--color-text-muted); background:white; border:1px solid var(--color-border); padding:6px 12px; border-radius:6px;">
            Status: ${escapeHtml(tkt.status)} ▾
          </span>
        </div>
      </div>

      <!-- Main Review Box (Matches Mockup Screen 8) -->
      <div class="card" style="margin-bottom:20px;">
        <div style="display:grid; grid-template-columns: 1.4fr 1fr; gap:24px;">
          <!-- Left: Findings -->
          <div>
            <div style="margin-bottom:18px;">
              <h4 style="font-size:13.5px; font-weight:700; color:var(--color-primary); margin-bottom:6px;">System Finding</h4>
              <p style="font-size:12.5px; color:var(--color-primary); margin-bottom:2px;">
                Tax discrepancy of <strong>${formatINR(tkt.difference_amount)}</strong> detected.
              </p>
              <div style="font-size:12px; color:var(--color-text-muted);">
                Expected tax: <strong>${formatINR(tkt.expected_tax)}</strong><br/>
                Recorded tax: <strong>${formatINR(tkt.recorded_tax)}</strong>
              </div>
            </div>

            <div>
              <h4 style="font-size:13.5px; font-weight:700; color:var(--color-primary); margin-bottom:6px;">User Finding</h4>
              <p style="font-size:12.5px; color:#475569; background:#F8FAFC; border:1px solid var(--color-border); padding:10px 12px; border-radius:6px; line-height:1.5;">
                ${escapeHtml(tkt.user_explanation)}
              </p>
            </div>
          </div>

          <!-- Right: Evidence File Card (Matches Mockup Screen 8) -->
          <div>
            <h4 style="font-size:13.5px; font-weight:700; color:var(--color-primary); margin-bottom:10px;">Evidence</h4>
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; background:white; border:1px solid var(--color-border); border-radius:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:22px; color:#DC2626;">📄</span>
                <div>
                  <div style="font-size:12.5px; font-weight:600; color:var(--color-primary);">${escapeHtml(tkt.evidence_file_name)}</div>
                  <div style="font-size:11px; color:var(--color-text-muted);">${escapeHtml(tkt.evidence_file_size)}</div>
                </div>
              </div>
              <button style="background:transparent; border:none; cursor:pointer; font-size:16px; color:#1E60F2;" title="Download" onclick="showToast('Downloading evidence file...', 'info')">📥</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Auditor Actions (Matches Mockup Screen 8) -->
      <div style="display:flex; justify-content:flex-end; gap:12px;">
        <button class="btn btn-secondary" style="border-color:#FECACA; color:#DC2626;" onclick="handleAuditorDecision('${tkt.id}', 'REVISION')">
          Reject & Return
        </button>
        <button class="btn btn-primary" onclick="handleAuditorDecision('${tkt.id}', 'RESOLVE')">
          Approve & Resolve
        </button>
      </div>
    </div>
  `;
}

function handleAuditorDecision(ticketId, decision) {
  const tkt = TaxGuardStore.tickets.find(t => t.id === ticketId);
  if (!tkt) return;

  if (decision === 'RESOLVE') {
    tkt.status = 'RESOLVED';
    tkt.auditor_notes = 'Verified against statutory rate card. Tax adjustment journal entry approved.';
    tkt.resolved_at = 'Just now';
    tkt.resolved_by = 'Auditor';

    TaxGuardStore.auditLogs.unshift({
      timestamp: 'Just now',
      user: 'Auditor',
      action: 'APPROVE_RESOLVE',
      entity: `Ticket #${ticketId}`,
      description: `Auditor approved resolution for ${tkt.invoice_id}. User can now close the ticket.`
    });

    showToast(`✓ Case approved & resolved!`, 'success');
  } else {
    tkt.status = 'Requires Action';
    showToast(`Case returned to user for additional documentation.`, 'info');
  }

  setTimeout(() => router.navigate('audit-queue'), 400);
}

// ==========================================
// 9. ADMIN DASHBOARD & USER MANAGEMENT (Matches Mockup Screen 9)
// ==========================================
function renderAdminDashboard() {
  renderAppShell();
  const container = document.getElementById('page-content');

  const pendingCount = TaxGuardStore.tickets.filter(t => t.status === 'PENDING_AUDIT').length;
  const resolvedCount = TaxGuardStore.tickets.filter(t => t.status === 'RESOLVED').length;
  const closedCount = TaxGuardStore.tickets.filter(t => t.status.startsWith('CLOSED')).length;

  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">Manage organization accounts, role authorization, and SLA interval closures</p>
        </div>
        <div>
          <button class="btn btn-primary" onclick="openAddUserModal()">
            + Add User
          </button>
        </div>
      </div>

      <!-- Users Table (Matches Mockup Screen 9) -->
      <div class="card" style="margin-bottom:24px;">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${TaxGuardStore.users.map(u => `
                <tr>
                  <td><strong>${escapeHtml(u.name)}</strong></td>
                  <td style="color:var(--color-text-muted);">${escapeHtml(u.email)}</td>
                  <td>${escapeHtml(u.role)}</td>
                  <td>
                    <span class="badge ${u.status === 'ACTIVE' ? 'badge-matched' : 'badge-issue'}">
                      ${u.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="toggleUserStatus('${u.id}')">
                      •••
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- SLA Interval Auto-Close Administration -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">SLA Auto-Close Interval Administration</h3>
          <span style="font-size:12px; color:var(--color-text-muted);">Auto-close window: 48h post-resolution</span>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Case Ticket</th>
                <th>Invoice</th>
                <th>Submitted By</th>
                <th>Status</th>
                <th>Interval Status</th>
                <th>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              ${TaxGuardStore.tickets.map(t => {
                const isResolved = t.status === 'RESOLVED';
                const isClosed = t.status.startsWith('CLOSED');
                return `
                  <tr>
                    <td><strong>#${escapeHtml(t.id)}</strong></td>
                    <td><strong>${escapeHtml(t.invoice_id)}</strong></td>
                    <td>${escapeHtml(t.submitted_by)}</td>
                    <td>
                      <span class="badge ${isClosed ? 'badge-matched' : isResolved ? 'badge-resolved' : 'badge-pending'}">
                        ${escapeHtml(t.status)}
                      </span>
                    </td>
                    <td style="font-size:12px; color:var(--color-text-muted);">
                      ${isClosed ? 'Archived' : isResolved ? '48h window active (Eligible to auto-close)' : 'Awaiting Auditor'}
                    </td>
                    <td>
                      ${isResolved ? `
                        <button class="btn btn-secondary btn-sm" onclick="handleAdminCloseTicket('${t.id}')">
                          Admin Close / Interval Expiry
                        </button>
                      ` : isClosed ? `
                        <span style="font-size:12px; color:#16A34A; font-weight:600;">Closed</span>
                      ` : `
                        <span style="font-size:12px; color:var(--color-text-muted);">Pending</span>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function handleAdminCloseTicket(ticketId) {
  const t = TaxGuardStore.tickets.find(x => x.id === ticketId);
  if (t) {
    t.status = 'CLOSED_BY_ADMIN';
    t.closed_by = 'Admin (Interval Expiry)';
    t.closed_at = 'Just now';

    TaxGuardStore.auditLogs.unshift({
      timestamp: 'Just now',
      user: 'Admin',
      action: 'ADMIN_CLOSE_TICKET',
      entity: `Ticket #${ticketId}`,
      description: `Admin auto-closed and archived Ticket #${ticketId} upon 48-hour resolution interval expiry`
    });

    showToast(`✓ Ticket #${ticketId} closed by Admin under interval expiry.`, 'success');
    renderAdminDashboard();
  }
}

function toggleUserStatus(id) {
  const u = TaxGuardStore.users.find(x => x.id === id);
  if (u) {
    u.status = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    showToast(`Status for ${u.name} updated to ${u.status}`, 'info');
    renderAdminDashboard();
  }
}

function openAddUserModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-add-user';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 class="modal-title">Add Organization User</h3>
        <button class="btn-close" onclick="document.getElementById('modal-add-user').remove()">✕</button>
      </div>
      <form id="form-new-user">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input type="text" id="nu-name" class="form-control" placeholder="e.g. Accounting Specialist" required>
        </div>
        <div class="form-group">
          <label class="form-label">Corporate Email</label>
          <input type="email" id="nu-email" class="form-control" placeholder="user@company.com" required>
        </div>
        <div class="form-group">
          <label class="form-label">Role</label>
          <select id="nu-role" class="input-select" style="width:100%;">
            <option value="USER">User (Finance Operations)</option>
            <option value="AUDITOR">Auditor (Compliance Review)</option>
            <option value="ADMIN">Admin (System Governance)</option>
          </select>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-add-user').remove()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save User</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('form-new-user').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('nu-name').value;
    const email = document.getElementById('nu-email').value;
    const role = document.getElementById('nu-role').value;

    TaxGuardStore.users.push({
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      status: 'ACTIVE'
    });

    document.getElementById('modal-add-user').remove();
    showToast(`User account for ${name} created!`, 'success');
    renderAdminDashboard();
  });
}

// User Cases List
function renderMyCases() {
  renderAppShell();
  const container = document.getElementById('page-content');
  const userTickets = TaxGuardStore.tickets;

  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">My Cases & Appeals</h1>
          <p class="page-subtitle">Track compliance appeals and accept resolutions</p>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Invoice</th>
              <th>Variance</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${userTickets.map(t => {
              const isResolved = t.status === 'RESOLVED';
              const isClosed = t.status === 'CLOSED_BY_USER' || t.status === 'CLOSED_BY_ADMIN';
              return `
                <tr>
                  <td><strong>#${escapeHtml(t.id)}</strong></td>
                  <td><strong>${escapeHtml(t.invoice_id)}</strong></td>
                  <td style="font-weight:600; color:var(--color-danger);">${formatINR(t.difference_amount)}</td>
                  <td>${escapeHtml(t.submitted_at)}</td>
                  <td>
                    <span class="badge ${isClosed ? 'badge-matched' : isResolved ? 'badge-resolved' : 'badge-pending'}">
                      ${isClosed ? (t.status === 'CLOSED_BY_USER' ? '✓ Closed by User' : '✓ Closed by Admin') : isResolved ? 'Resolution Ready' : 'Under Review'}
                    </span>
                  </td>
                  <td>
                    ${isResolved ? `
                      <button class="btn btn-success btn-sm" onclick="handleUserCloseTicket('${t.id}')">
                        Close Ticket ✓
                      </button>
                    ` : isClosed ? `
                      <span style="font-size:12px; color:var(--color-text-muted);">Completed</span>
                    ` : `
                      <a class="btn-table-view" onclick="router.navigate('discrepancy/${encodeURIComponent(t.invoice_id)}')">
                        Track Progress
                      </a>
                    `}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Financial Reports with working CSV export
function renderReports() {
  renderAppShell();
  const container = document.getElementById('page-content');
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Compliance Reports</h1>
          <p class="page-subtitle">Export reconciled financial ledgers and discrepancy audit summaries</p>
        </div>
        <div>
          <button class="btn btn-primary" onclick="exportReconciliationReportCsv()">
            📥 Export Reconciled CSV
          </button>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px;">
        <h3 class="card-title" style="margin-bottom:12px;">Executive Period Summary</h3>
        <p style="font-size:13px; color:var(--color-text-muted); line-height:1.6; margin-bottom:16px;">
          For the fiscal audit period ending 30 April 2025, TaxGuard analyzed 10,000 corporate transactions across invoices, bank settlement gateways, and general ledger journal lines.
        </p>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px;">
          <div style="background:#F8FAFC; border:1px solid var(--color-border); border-radius:8px; padding:16px;">
            <div style="font-size:12px; color:var(--color-text-muted);">Match Rate</div>
            <div style="font-size:22px; font-weight:700; color:#16A34A; margin-top:4px;">87.2%</div>
            <div style="font-size:11px; color:var(--color-text-muted); margin-top:2px;">8,720 confirmed records</div>
          </div>
          <div style="background:#F8FAFC; border:1px solid var(--color-border); border-radius:8px; padding:16px;">
            <div style="font-size:12px; color:var(--color-text-muted);">Flagged Rate</div>
            <div style="font-size:22px; font-weight:700; color:#DC2626; margin-top:4px;">8.4%</div>
            <div style="font-size:11px; color:var(--color-text-muted); margin-top:2px;">842 flagged variances</div>
          </div>
          <div style="background:#F8FAFC; border:1px solid var(--color-border); border-radius:8px; padding:16px;">
            <div style="font-size:12px; color:var(--color-text-muted);">Statutory Variance</div>
            <div style="font-size:22px; font-weight:700; color:var(--color-primary); margin-top:4px;">₹33,700</div>
            <div style="font-size:11px; color:var(--color-text-muted); margin-top:2px;">Net tax adjustment delta</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function exportReconciliationReportCsv() {
  const rows = [
    ['Invoice ID', 'Date', 'Merchant', 'Amount', 'Taxable Amount', 'Tax Rate %', 'Recorded Tax', 'Expected Tax', 'Difference', 'Issue Type', 'Status'],
    ...TaxGuardStore.discrepancies.map(d => [
      d.invoice_id,
      d.invoice_date,
      `"${d.merchant_name || ''}"`,
      d.amount,
      d.taxable_amount,
      d.tax_rate,
      d.recorded_tax,
      d.expected_tax,
      d.difference_amount,
      `"${d.issue_type || 'None'}"`,
      d.status
    ])
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'taxguard_reconciliation_report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('✓ Reconciliation CSV exported successfully!', 'success');
}

// Audit Logs
function renderAuditLogs() {
  renderAppShell();
  const container = document.getElementById('page-content');
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Audit Logs</h1>
          <p class="page-subtitle">Immutable timeline of user actions, appeals, and system operations</p>
        </div>
      </div>

      <div class="card">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Role / User</th>
                <th>Action</th>
                <th>Target Entity</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${TaxGuardStore.auditLogs.map(l => `
                <tr>
                  <td style="font-size:12px; color:var(--color-text-muted);">${escapeHtml(l.timestamp)}</td>
                  <td><strong>${escapeHtml(l.user)}</strong></td>
                  <td><span style="font-size:11px; font-weight:600; padding:2px 7px; border-radius:4px; background:#F1F5F9;">${escapeHtml(l.action)}</span></td>
                  <td>${escapeHtml(l.entity)}</td>
                  <td style="font-size:12.5px;">${escapeHtml(l.description)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Router Registration
window.addEventListener('DOMContentLoaded', () => {
  router.register('login', renderLogin);
  router.register('dashboard', renderDashboard);
  router.register('upload', renderUpload);
  router.register('processing', renderProcessing);
  router.register('results', renderResults);
  router.register('discrepancy/:id', renderDiscrepancy);
  router.register('audit-queue', renderAuditorQueue);
  router.register('resolved-cases', () => {
    auditorTab = 'resolved';
    renderAuditorQueue();
  });
  router.register('case-review/:id', renderCaseReview);
  router.register('my-cases', renderMyCases);
  router.register('admin-dashboard', renderAdminDashboard);
  router.register('admin-tickets', renderAdminDashboard);
  router.register('admin-users', renderAdminDashboard);
  router.register('reports', renderReports);
  router.register('audit-logs', renderAuditLogs);

  router.init();
});
