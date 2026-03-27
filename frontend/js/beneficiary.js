/**
 * beneficiary.js – Beneficiary dashboard logic
 * Handles application submission, real-time priority score, application history
 */

// ── Auth guard ─────────────────────────────────────────────────────────────
const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user || user.role !== 'beneficiary') {
  window.location.href = '/';
}

// ── On page load ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Populate user identity
  const initials = user.name.charAt(0).toUpperCase();
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('sidebarName').textContent   = user.name;
  document.getElementById('headerAvatar').textContent  = initials;
  document.getElementById('welcomeName').textContent   = user.name.split(' ')[0];

  // Initial priority score calculation
  calcPriority();

  loadApplications();
});

// ── Navigation ─────────────────────────────────────────────────────────────
function showSection(name, linkEl) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`section-${name}`).classList.add('active');
  if (linkEl) linkEl.classList.add('active');

  const titles = { dashboard: 'Dashboard', apply: 'Apply for Aid', applications: 'My Applications' };
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

// ── Real-time priority score calculator ────────────────────────────────────
function calcPriority() {
  const income    = parseInt(document.getElementById('incomeLevel').value);
  const emergency = parseInt(document.getElementById('emergencyLevel').value);
  const need      = parseInt(document.getElementById('needScore').value);

  // Priority formula: (10 - income) * 3 + emergency * 4 + need * 3
  const incomeFactor    = (10 - income) * 3;
  const emergencyFactor = emergency * 4;
  const needFactor      = need * 3;
  const total           = incomeFactor + emergencyFactor + needFactor;

  // Update breakdown display
  document.getElementById('bkIncome').textContent    = incomeFactor;
  document.getElementById('bkEmergency').textContent = emergencyFactor;
  document.getElementById('bkNeed').textContent      = needFactor;
  document.getElementById('bkTotal').textContent     = total;
  document.getElementById('priorityScore').textContent = total;

  // Determine priority tier
  let tier, label;
  if (total >= 60) {
    tier  = 'high';
    label = '🟢 High Priority';
  } else if (total >= 35) {
    tier  = 'medium';
    label = '🟡 Medium Priority';
  } else {
    tier  = 'low';
    label = '🔴 Low Priority';
  }

  // Update visual indicators
  const circle = document.getElementById('priorityCircle');
  circle.className = `priority-circle ${tier}`;

  const labelEl = document.getElementById('priorityLabel');
  labelEl.className = `priority-label ${tier}`;
  labelEl.textContent = label;
}

// ── Slider display update ──────────────────────────────────────────────────
function updateSlider(displayId, value) {
  document.getElementById(displayId).textContent = value;
}

// ── Load applications ──────────────────────────────────────────────────────
async function loadApplications() {
  const tableContainer = document.getElementById('applicationsTable');
  const dashContainer  = document.getElementById('dashApplicationsTable');

  try {
    const res  = await apiFetch('/api/applications/my');
    if (!res) return;
    const data = await res.json();

    // Compute stats
    const total    = data.length;
    const approved = data.filter(a => a.status === 'approved').length;
    const pending  = data.filter(a => a.status === 'pending').length;

    animateNumber('stat-total',    total,    false);
    animateNumber('stat-approved', approved, false);
    animateNumber('stat-pending',  pending,  false);

    renderApplicationsTable(dashContainer, data.slice(0, 5));
    renderApplicationsTable(tableContainer, data);

  } catch (err) {
    showToast('Failed to load applications', 'error');
  }
}

function renderApplicationsTable(container, apps) {
  if (!container) return;

  if (!apps || apps.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>No applications yet. Apply for financial assistance to get started.</p>
      </div>`;
    return;
  }

  const rows = apps.map(a => `
    <tr>
      <td>#${a.id}</td>
      <td style="font-weight:600">${escHtml(a.title)}</td>
      <td>${formatCurrency(a.amount_requested)}</td>
      ${a.amount_allocated
        ? `<td style="color:#4fe995;font-weight:600">${formatCurrency(a.amount_allocated)}</td>`
        : `<td style="color:var(--text-muted)">—</td>`}
      <td><span class="${getPriorityClass(a.priority_score)}">${a.priority_score}</span></td>
      <td>${getStatusBadge(a.status)}</td>
      <td>${formatDate(a.created_at)}</td>
    </tr>`).join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Title</th><th>Requested</th>
            <th>Allocated</th><th>Priority</th><th>Status</th><th>Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── Handle application form submission ─────────────────────────────────────
async function handleApply(e) {
  e.preventDefault();

  const title         = document.getElementById('appTitle').value.trim();
  const description   = document.getElementById('appDescription').value.trim();
  const amount        = document.getElementById('appAmount').value;
  const income_level  = parseInt(document.getElementById('incomeLevel').value);
  const emergency_level = parseInt(document.getElementById('emergencyLevel').value);
  const need_score    = parseInt(document.getElementById('needScore').value);
  const btn           = document.getElementById('applyBtn');

  if (!title || !description || !amount) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  if (parseFloat(amount) <= 0) {
    showToast('Amount requested must be greater than $0', 'error');
    return;
  }

  setLoading(btn, true);

  try {
    const res  = await apiFetch('/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        amount_requested: parseFloat(amount),
        income_level,
        emergency_level,
        need_score
      })
    });
    if (!res) return;

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || 'Application submission failed', 'error');
      return;
    }

    showToast(`🎉 Application submitted! Priority score: ${data.priority_score}`, 'success');

    // Reset form
    document.getElementById('applyForm').reset();
    // Reset sliders to default value 5
    ['incomeLevel', 'emergencyLevel', 'needScore'].forEach(id => {
      document.getElementById(id).value = 5;
    });
    ['incomeVal', 'emergencyVal', 'needVal'].forEach(id => {
      document.getElementById(id).textContent = 5;
    });
    calcPriority();

    // Reload applications and navigate to list
    loadApplications();
    showSection('applications', document.querySelector('[data-section=applications]'));

  } catch (err) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    setLoading(btn, false);
  }
}

// ── Logout ─────────────────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatCurrency(amount) {
  return '$' + parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function animateNumber(elId, target, isCurrency) {
  const el       = document.getElementById(elId);
  if (!el) return;
  const duration = 900;
  const start    = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const value    = target * eased;
    el.textContent = isCurrency ? formatCurrency(value) : Math.round(value);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}

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
