/**
 * donor.js – Donor dashboard logic
 * Handles donation submission, history loading, stats, sidebar navigation
 */

// ── Auth guard ─────────────────────────────────────────────────────────────
const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user || user.role !== 'donor') {
  window.location.href = '/';
}

// ── On page load ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Populate user identity in sidebar / header
  const initials = user.name.charAt(0).toUpperCase();
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('sidebarName').textContent   = user.name;
  document.getElementById('headerAvatar').textContent  = initials;
  document.getElementById('welcomeName').textContent   = user.name.split(' ')[0];

  loadDonations();
});

// ── Navigation ─────────────────────────────────────────────────────────────
function showSection(name, linkEl) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`section-${name}`).classList.add('active');
  if (linkEl) linkEl.classList.add('active');

  const titles = { dashboard: 'Dashboard', donate: 'Donate Now', history: 'My Donations' };
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

// ── Load and display all donations by this donor ───────────────────────────
async function loadDonations() {
  const tableContainer = document.getElementById('donationsTable');
  const dashContainer  = document.getElementById('dashDonationsTable');

  try {
    const res  = await apiFetch('/api/donations/my');
    if (!res) return;
    const data = await res.json();

    // Compute stats
    const total  = data.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const count  = data.length;
    const avg    = count > 0 ? total / count : 0;

    // Animate stat cards
    animateNumber('stat-total', total, true);
    animateNumber('stat-count', count, false);
    animateNumber('stat-avg',   avg,   true);

    // Render dashboard preview (latest 5)
    renderDonationTable(dashContainer, data.slice(0, 5));
    // Render full history
    renderDonationTable(tableContainer, data);

  } catch (err) {
    showToast('Failed to load donations', 'error');
  }
}

function renderDonationTable(container, donations) {
  if (!container) return;

  if (!donations || donations.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💸</div>
        <p>No donations yet. Make your first contribution!</p>
      </div>`;
    return;
  }

  const rows = donations.map(d => `
    <tr>
      <td>#${d.id}</td>
      <td style="font-weight:700;color:#4fe995">${formatCurrency(d.amount)}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(d.message || '')}">${escHtml(d.message || '—')}</td>
      <td>${formatDate(d.created_at)}</td>
    </tr>`).join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Amount</th><th>Message</th><th>Date</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── Handle donation form submission ────────────────────────────────────────
async function handleDonate(e) {
  e.preventDefault();

  const amount  = document.getElementById('donationAmount').value;
  const message = document.getElementById('donationMessage').value.trim();
  const btn     = document.getElementById('donateBtn');

  if (!amount || parseFloat(amount) <= 0) {
    showToast('Please enter a valid donation amount', 'error');
    return;
  }

  setLoading(btn, true);

  try {
    const res  = await apiFetch('/api/donations', {
      method: 'POST',
      body: JSON.stringify({ amount: parseFloat(amount), message })
    });
    if (!res) return;

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || 'Donation failed', 'error');
      return;
    }

    showToast(`🎉 Thank you! Donation of ${formatCurrency(amount)} received.`, 'success');

    // Clear form
    document.getElementById('donationForm').reset();

    // Reload data
    loadDonations();

    // Navigate to history
    showSection('history', document.querySelector('[data-section=history]'));

  } catch (err) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    setLoading(btn, false);
  }
}

// ── Quick amount selector ──────────────────────────────────────────────────
function setAmount(value) {
  document.getElementById('donationAmount').value = value;
  // Highlight active quick button
  document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
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

function animateNumber(elId, target, isCurrency) {
  const el       = document.getElementById(elId);
  if (!el) return;
  const duration = 1000;
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
