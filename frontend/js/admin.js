/**
 * admin.js – Admin dashboard logic
 * Handles stats, applications, donations, users, approve/reject workflow
 */

// ── Auth guard ─────────────────────────────────────────────────────────────
const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user || user.role !== 'admin') {
  window.location.href = '/login.html';
}

// ── State ──────────────────────────────────────────────────────────────────
let pendingAction     = null;   // { action: 'approve'|'reject', id }
let allApplications   = [];

// ── On page load ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Populate user info in sidebar and header
  const initials = user.name.charAt(0).toUpperCase();
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('sidebarName').textContent   = user.name;
  document.getElementById('headerAvatar').textContent  = initials;

  // Live clock in header
  updateClock();
  setInterval(updateClock, 60000);

  loadStats();
  loadApplications();
  loadDonations();
  loadUsers();
  loadReportSummary();
  loadRecentDonations();
  loadPeriodReport();
  loadPurposeReport();
  loadDateReport();
});

function updateClock() {
  const el = document.getElementById('headerTime');
  if (el) el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Navigation ─────────────────────────────────────────────────────────────
function showSection(name, linkEl) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`section-${name}`).classList.add('active');
  if (linkEl) linkEl.classList.add('active');

  const titles = { dashboard: 'Dashboard', applications: 'Applications', donations: 'Donations', users: 'Users', reports: 'Reports', flowchart: 'Priority Flowchart' };
  document.getElementById('pageTitle').textContent = titles[name] || name;
  return false;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}

// ── API helper ─────────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  if (res.status === 401 || res.status === 403) {
    logout();
    return null;
  }
  return res;
}

// ── Load stats and animate number counters ─────────────────────────────────
async function loadStats() {
  try {
    const res  = await apiFetch('/api/admin/stats');
    if (!res) return;
    const data = await res.json();

    animateNumber('stat-donations', data.total_donations, true);
    animateNumber('stat-pending',   data.pending_applications, false);
    animateNumber('stat-approved',  data.approved_applications, false);
    animateNumber('stat-available', data.available_funds, true);

    // Update the nav badge
    document.getElementById('pendingBadge').textContent = data.pending_applications;

    // Render quick top-priority preview on dashboard
    renderDashTable();
  } catch (err) {
    showToast('Failed to load stats', 'error');
  }
}

/** Animate a number counter from 0 to target */
function animateNumber(elId, target, isCurrency) {
  const el       = document.getElementById(elId);
  const duration = 1200;
  const start    = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);  // ease-out cubic
    const value    = target * eased;
    el.textContent = isCurrency ? formatCurrency(value) : Math.round(value);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = isCurrency ? formatCurrency(target) : target;
  }
  requestAnimationFrame(update);
}

// ── Load applications ──────────────────────────────────────────────────────
async function loadApplications() {
  try {
    const res  = await apiFetch('/api/admin/applications');
    if (!res) return;
    allApplications = await res.json();

    renderApplicationsTable('applicationsTable', allApplications, true);  // full table
    renderDashTable();
  } catch (err) {
    showToast('Failed to load applications', 'error');
  }
}

function renderDashTable() {
  const top5 = [...allApplications].slice(0, 5);
  renderApplicationsTable('dashApplicationsTable', top5, false);
}

function renderApplicationsTable(containerId, apps, showActions) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!apps || apps.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>No applications found.</p></div>`;
    return;
  }

  const rows = apps.map(a => {
    const bd = a.score_breakdown || {};
    const breakdownTip = `Income: +${bd.incomeFactor || 0} | Family: +${bd.familyFactor || 0} | Urgency: +${bd.urgencyFactor || 0} | Docs: +${bd.documentFactor || 0}`;
    return `
    <tr>
      <td>#${a.id}</td>
      <td>
        <div style="font-weight:600">${escHtml(a.beneficiary_name)}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">${escHtml(a.beneficiary_email)}</div>
      </td>
      <td>${escHtml(a.category)}</td>
      <td>${formatCurrency(a.amount)}</td>
      <td>
        <span class="${getPriorityClass(a.priority_score)}" title="${escHtml(breakdownTip)}">${a.priority_score}</span>
        <div class="score-breakdown-mini">
          <span title="Income factor">💵 +${bd.incomeFactor || 0}</span>
          <span title="Family factor">👨‍👩‍👧 +${bd.familyFactor || 0}</span>
          <span title="Urgency factor">⚡ +${bd.urgencyFactor || 0}</span>
          <span title="Documents factor">📄 +${bd.documentFactor || 0}</span>
        </div>
      </td>
      <td>${getStatusBadge(a.status)}</td>
      <td>${formatDate(a.created_at)}</td>
      ${showActions ? `<td>
        ${a.status === 'pending' ? `
          <button class="action-btn action-approve" onclick="confirmAction('approve', ${a.id})">✅ Approve</button>
          <button class="action-btn action-reject"  onclick="confirmAction('reject',  ${a.id})">❌ Reject</button>
        ` : '–'}
      </td>` : ''}
    </tr>`;
  }).join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Beneficiary</th><th>Category</th>
            <th>Amount</th><th>Priority / Breakdown</th><th>Status</th><th>Date</th>
            ${showActions ? '<th>Actions</th>' : ''}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── Load donations ─────────────────────────────────────────────────────────
async function loadDonations() {
  const container = document.getElementById('donationsTable');
  try {
    const res  = await apiFetch('/api/admin/donations');
    if (!res) return;
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">💸</div><p>No donations yet.</p></div>`;
      return;
    }

    const rows = data.map(d => `
      <tr>
        <td>#${d.id}</td>
        <td>${escHtml(d.donor_name)}</td>
        <td style="color:var(--text-muted);font-size:0.75rem">${escHtml(d.donor_email)}</td>
        <td style="font-weight:700;color:#4fe995">${formatCurrency(d.amount)}</td>
        <td><span class="badge badge-purpose">${escHtml(d.purpose || 'General Welfare')}</span></td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(d.message || '')}">${escHtml(d.message || '—')}</td>
        <td>${formatDate(d.created_at)}</td>
      </tr>`).join('');

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Donor</th><th>Email</th><th>Amount</th><th>Purpose</th><th>Message</th><th>Date</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  } catch (err) {
    showToast('Failed to load donations', 'error');
  }
}

// ── Load users ─────────────────────────────────────────────────────────────
async function loadUsers() {
  const container = document.getElementById('usersTable');
  try {
    const res  = await apiFetch('/api/admin/users');
    if (!res) return;
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><p>No users found.</p></div>`;
      return;
    }

    const rows = data.map(u => `
      <tr>
        <td>#${u.id}</td>
        <td style="font-weight:600">${escHtml(u.name)}</td>
        <td>${escHtml(u.email)}</td>
        <td>${getRoleBadge(u.role)}</td>
        <td>${formatDate(u.created_at)}</td>
      </tr>`).join('');

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  } catch (err) {
    showToast('Failed to load users', 'error');
  }
}

// ── Approve / Reject workflow ──────────────────────────────────────────────
function confirmAction(action, id) {
  pendingAction = { action, id };
  const isApprove = action === 'approve';
  document.getElementById('modalIcon').textContent  = isApprove ? '✅' : '❌';
  document.getElementById('modalTitle').textContent = isApprove ? 'Approve Application' : 'Reject Application';
  document.getElementById('modalBody').textContent  = isApprove
    ? 'Are you sure you want to approve this application and allocate funds?'
    : 'Are you sure you want to reject this application? This cannot be undone.';
  const confirmBtn = document.getElementById('modalConfirmBtn');
  confirmBtn.className = `btn ${isApprove ? 'btn-success' : 'btn-danger'}`;
  confirmBtn.textContent = isApprove ? '✅ Approve' : '❌ Reject';
  document.getElementById('confirmModal').classList.add('open');
}

function closeModal() {
  document.getElementById('confirmModal').classList.remove('open');
  pendingAction = null;
}

async function modalConfirm() {
  if (!pendingAction) return;
  const { action, id } = pendingAction;
  closeModal();

  try {
    const res  = await apiFetch(`/api/admin/applications/${id}/${action}`, { method: 'PUT' });
    if (!res) return;
    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || `Failed to ${action} application`, 'error');
      return;
    }

    showToast(data.message || `Application ${action}d successfully`, 'success');
    // Reload affected data
    loadStats();
    loadApplications();
  } catch (err) {
    showToast(`Network error while trying to ${action}`, 'error');
  }
}

// ── Report: Summary ────────────────────────────────────────────────────────
async function loadReportSummary() {
  try {
    const res  = await apiFetch('/api/admin/reports/summary');
    if (!res || !res.ok) return;
    const data = await res.json();
    animateNumber('rep-total-amount', data.total_amount, true);
    animateNumber('rep-total-count',  data.total_donations, false);
    animateNumber('rep-avg',          data.average_donation, true);
    animateNumber('rep-donors',       data.total_donors, false);
  } catch (_) {}
}

// ── Report: Recent 10-day donations ────────────────────────────────────────
async function loadRecentDonations() {
  const container = document.getElementById('recentDonationsTable');
  if (!container) return;
  try {
    const res  = await apiFetch('/api/admin/reports/recent');
    if (!res) return;
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>No donations in the last 10 days.</p></div>`;
      return;
    }

    const rows = data.map(d => `
      <tr>
        <td>#${d.id}</td>
        <td>${escHtml(d.donor_name)}</td>
        <td style="color:var(--text-muted);font-size:0.75rem">${escHtml(d.donor_email)}</td>
        <td style="font-weight:700;color:#4fe995">${formatCurrency(d.amount)}</td>
        <td><span class="badge badge-purpose">${escHtml(d.purpose || 'General Welfare')}</span></td>
        <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(d.message || '')}">${escHtml(d.message || '—')}</td>
        <td>${formatDate(d.created_at)}</td>
      </tr>`).join('');

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Donor</th><th>Email</th><th>Amount</th><th>Purpose</th><th>Message</th><th>Date</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  } catch (_) {
    container.innerHTML = `<div class="empty-state"><p>Failed to load recent donations.</p></div>`;
  }
}

// ── Report: Period-wise ─────────────────────────────────────────────────────
async function loadPeriodReport() {
  const container = document.getElementById('periodReportTable');
  if (!container) return;
  container.innerHTML = `<div class="loading-spinner"><div class="spinner-ring"></div></div>`;

  const from = document.getElementById('periodFrom') ? document.getElementById('periodFrom').value : '';
  const to   = document.getElementById('periodTo')   ? document.getElementById('periodTo').value   : '';
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to)   params.set('to', to);

  try {
    const res  = await apiFetch(`/api/admin/reports/period?${params}`);
    if (!res) return;
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📅</div><p>No data for the selected period.</p></div>`;
      return;
    }

    const grandTotal = data.reduce((s, r) => s + parseFloat(r.total_amount), 0);
    const rows = data.map(r => `
      <tr>
        <td style="font-weight:600">${escHtml(r.period)}</td>
        <td>${r.donation_count}</td>
        <td style="font-weight:700;color:#4fe995">${formatCurrency(r.total_amount)}</td>
        <td>
          <div style="background:rgba(255,255,255,0.08);border-radius:4px;height:10px;width:100%;overflow:hidden">
            <div style="height:10px;background:linear-gradient(90deg,#667eea,#764ba2);width:${grandTotal > 0 ? Math.round(parseFloat(r.total_amount)/grandTotal*100) : 0}%;border-radius:4px"></div>
          </div>
          <span style="font-size:0.75rem;color:var(--text-muted)">${grandTotal > 0 ? Math.round(parseFloat(r.total_amount)/grandTotal*100) : 0}%</span>
        </td>
      </tr>`).join('');

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Month</th><th>Donations</th><th>Total Amount</th><th>Share</th></tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr style="background:rgba(102,126,234,0.1)"><td style="font-weight:700">Grand Total</td><td style="font-weight:700">${data.reduce((s,r)=>s+parseInt(r.donation_count),0)}</td><td style="font-weight:700;color:#4fe995">${formatCurrency(grandTotal)}</td><td></td></tr></tfoot>
        </table>
      </div>`;
  } catch (_) {
    container.innerHTML = `<div class="empty-state"><p>Failed to load period report.</p></div>`;
  }
}

function clearPeriodFilter() {
  const f = document.getElementById('periodFrom');
  const t = document.getElementById('periodTo');
  if (f) f.value = '';
  if (t) t.value = '';
  loadPeriodReport();
}

// ── Report: Purpose/Reason-wise ─────────────────────────────────────────────
async function loadPurposeReport() {
  const container = document.getElementById('purposeReportChart');
  if (!container) return;
  container.innerHTML = `<div class="loading-spinner"><div class="spinner-ring"></div></div>`;

  try {
    const res  = await apiFetch('/api/admin/reports/purpose');
    if (!res) return;
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🎯</div><p>No purpose data available.</p></div>`;
      return;
    }

    const grandTotal = data.reduce((s, r) => s + parseFloat(r.total_amount), 0);
    const purposeColors = {
      'General Welfare':  '#667eea',
      'Medical Aid':      '#ef4444',
      'Education':        '#4fe995',
      'Emergency Relief': '#f97316',
      'Food & Nutrition': '#fbbf24',
      'Shelter':          '#a78bfa',
      'Other':            '#94a3b8'
    };

    const bars = data.map(r => {
      const pct = grandTotal > 0 ? Math.round(parseFloat(r.total_amount) / grandTotal * 100) : 0;
      const color = purposeColors[r.purpose] || '#667eea';
      return `
        <div style="margin-bottom:1rem">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem">
            <span style="font-weight:600;color:#fff">${escHtml(r.purpose)}</span>
            <span style="color:${color};font-weight:700">${formatCurrency(r.total_amount)} &nbsp;(${r.donation_count} donations, ${pct}%)</span>
          </div>
          <div style="background:rgba(255,255,255,0.08);border-radius:6px;height:20px;width:100%;overflow:hidden">
            <div style="height:20px;background:${color};width:${pct}%;border-radius:6px;transition:width 0.6s ease"></div>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `<div style="padding:1rem 1.5rem">${bars}</div>`;
  } catch (_) {
    container.innerHTML = `<div class="empty-state"><p>Failed to load purpose report.</p></div>`;
  }
}

// ── Report: Date-wise ───────────────────────────────────────────────────────
async function loadDateReport() {
  const container = document.getElementById('dateReportTable');
  if (!container) return;
  container.innerHTML = `<div class="loading-spinner"><div class="spinner-ring"></div></div>`;

  try {
    const res  = await apiFetch('/api/admin/reports/date');
    if (!res) return;
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📆</div><p>No donations in the last 30 days.</p></div>`;
      return;
    }

    const maxAmount = Math.max(...data.map(r => parseFloat(r.total_amount)));
    const rows = data.map(r => {
      const pct = maxAmount > 0 ? Math.round(parseFloat(r.total_amount) / maxAmount * 100) : 0;
      return `
        <tr>
          <td style="font-weight:600">${new Date(r.date).toLocaleDateString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}</td>
          <td>${r.donation_count}</td>
          <td style="font-weight:700;color:#4fe995">${formatCurrency(r.total_amount)}</td>
          <td style="min-width:120px">
            <div style="background:rgba(255,255,255,0.08);border-radius:4px;height:10px;width:100%;overflow:hidden">
              <div style="height:10px;background:linear-gradient(90deg,#4fe995,#4facfe);width:${pct}%;border-radius:4px"></div>
            </div>
          </td>
        </tr>`;
    }).join('');

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Donations</th><th>Total Amount</th><th>Relative Amount</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  } catch (_) {
    container.innerHTML = `<div class="empty-state"><p>Failed to load date report.</p></div>`;
  }
}

// ── Logout ─────────────────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatCurrency(amount) {
  return '₹' + parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getPriorityClass(score) {
  if (score >= 60) return 'priority-high';
  if (score >= 35) return 'priority-medium';
  return 'priority-low';
}

function getStatusBadge(status) {
  const map = { pending: '⏳ Pending', approved: '✅ Approved', rejected: '❌ Rejected' };
  return `<span class="badge badge-${status}">${map[status] || status}</span>`;
}

function getRoleBadge(role) {
  const map = { admin: '🛡️ Admin', donor: '💸 Donor', beneficiary: '🤝 Beneficiary' };
  return `<span class="badge badge-${role}">${map[role] || role}</span>`;
}

/** Escape HTML to prevent XSS */
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className   = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}
