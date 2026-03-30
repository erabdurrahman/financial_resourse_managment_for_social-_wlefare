/**
 * beneficiary.js – Beneficiary dashboard logic
 * Handles multi-step application form, application history, and status tracking
 */

// ── Auth guard ─────────────────────────────────────────────────────────────
const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user || user.role !== 'beneficiary') {
  window.location.href = '/login.html';
}

// ── Multi-step form state ──────────────────────────────────────────────────
let currentStep = 1;
const TOTAL_STEPS = 5;

// ── On page load ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Populate user identity
  const initials = user.name.charAt(0).toUpperCase();
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('sidebarName').textContent   = user.name;
  document.getElementById('headerAvatar').textContent  = initials;
  document.getElementById('welcomeName').textContent   = user.name.split(' ')[0];

  // Auto-fill personal info from account
  document.getElementById('appFullName').value = user.name || '';
  document.getElementById('appEmail').value    = user.email || '';

  // File input labels update on selection
  ['incomeProof', 'idProof', 'supportingDocs'].forEach(id => {
    const input = document.getElementById(id);
    const nameEl = document.getElementById(id + 'Name');
    if (input && nameEl) {
      input.addEventListener('change', () => {
        const files = Array.from(input.files);
        nameEl.textContent = files.length > 0
          ? files.map(f => f.name).join(', ')
          : '';
      });
    }
  });

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

  // Reset multi-step form when navigating to apply section
  if (name === 'apply') {
    goToStep(1);
  }
  return false;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}

// ── API helper ─────────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const headers = { 'Authorization': `Bearer ${token}` };
  // Only add Content-Type for JSON bodies (not FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  if (res.status === 401 || res.status === 403) {
    logout();
    return null;
  }
  return res;
}

// ── Multi-step form navigation ──────────────────────────────────────────────
function goToStep(step) {
  // Hide all steps
  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  // Show target step
  const target = document.getElementById(`step-${step}`);
  if (target) target.classList.add('active');

  // Update stepper indicators
  document.querySelectorAll('.step').forEach(el => {
    const n = parseInt(el.dataset.step);
    el.classList.remove('active', 'completed');
    if (n === step) el.classList.add('active');
    else if (n < step) el.classList.add('completed');
  });

  currentStep = step;
}

function nextStep(step) {
  if (!validateStep(step)) return;
  if (step < TOTAL_STEPS) goToStep(step + 1);
}

function prevStep(step) {
  if (step > 1) goToStep(step - 1);
}

// ── Step validation ─────────────────────────────────────────────────────────
function validateStep(step) {
  switch (step) {
    case 1: {
      const phone   = document.getElementById('appPhone').value.trim();
      const address = document.getElementById('appAddress').value.trim();
      if (!phone) {
        showToast('Please enter your phone number', 'error');
        return false;
      }
      if (!address) {
        showToast('Please enter your address', 'error');
        return false;
      }
      return true;
    }
    case 2: {
      const income     = document.getElementById('appIncome').value;
      const family     = document.getElementById('appFamily').value;
      const employment = document.getElementById('appEmployment').value;
      if (!income || parseFloat(income) < 0) {
        showToast('Please enter a valid monthly income (0 or more)', 'error');
        return false;
      }
      if (!family || parseInt(family) < 1) {
        showToast('Please enter the number of family members (at least 1)', 'error');
        return false;
      }
      if (!employment) {
        showToast('Please select your employment status', 'error');
        return false;
      }
      return true;
    }
    case 3: {
      const amount   = document.getElementById('appAmount').value;
      const category = document.getElementById('appCategory').value;
      const reason   = document.getElementById('appReason').value.trim();
      if (!amount || parseFloat(amount) <= 0) {
        showToast('Please enter a valid amount greater than ₹0', 'error');
        return false;
      }
      if (!category) {
        showToast('Please select a category', 'error');
        return false;
      }
      if (!reason) {
        showToast('Please describe your reason for the request', 'error');
        return false;
      }
      return true;
    }
    case 4: {
      const urgency = document.getElementById('appUrgency').value;
      if (!urgency) {
        showToast('Please select an urgency level', 'error');
        return false;
      }
      return true;
    }
    default:
      return true;
  }
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
      <td style="font-weight:600">${escHtml(a.category)}</td>
      <td>${formatCurrency(a.amount)}</td>
      ${a.amount_allocated
        ? `<td style="color:#4fe995;font-weight:600">${formatCurrency(a.amount_allocated)}</td>`
        : `<td style="color:var(--text-muted)">—</td>`}
      <td>${getStatusBadge(a.status)}</td>
      <td>${formatDate(a.created_at)}</td>
    </tr>`).join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Category</th><th>Requested</th>
            <th>Allocated</th><th>Status</th><th>Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── Handle application form submission ─────────────────────────────────────
async function handleApply(e) {
  e.preventDefault();

  // Validate step 5 (documents)
  const incomeProof = document.getElementById('incomeProof').files[0];
  const idProof     = document.getElementById('idProof').files[0];

  if (!incomeProof) {
    showToast('Please upload your income proof document', 'error');
    return;
  }
  if (!idProof) {
    showToast('Please upload your ID proof document', 'error');
    return;
  }

  const btn = document.getElementById('applyBtn');
  setLoading(btn, true);

  try {
    // Use FormData for multipart upload (files + text fields)
    const formData = new FormData();
    formData.append('phone',             document.getElementById('appPhone').value.trim());
    formData.append('address',           document.getElementById('appAddress').value.trim());
    formData.append('income',            document.getElementById('appIncome').value);
    formData.append('family_members',    document.getElementById('appFamily').value);
    formData.append('employment_status', document.getElementById('appEmployment').value);
    formData.append('amount',            document.getElementById('appAmount').value);
    formData.append('category',          document.getElementById('appCategory').value);
    formData.append('reason',            document.getElementById('appReason').value.trim());
    formData.append('urgency',           document.getElementById('appUrgency').value);
    formData.append('income_proof',  incomeProof);
    formData.append('id_proof',      idProof);

    const supportingDocs = document.getElementById('supportingDocs').files;
    for (const f of supportingDocs) {
      formData.append('supporting_docs', f);
    }

    const res = await apiFetch('/api/applications', {
      method: 'POST',
      body: formData
    });
    if (!res) return;

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || 'Application submission failed', 'error');
      return;
    }

    // Show success message
    showToast('🎉 Application submitted successfully! Our team will review it shortly.', 'success');

    // Reset form and go back to step 1
    document.getElementById('applyForm').reset();
    // Clear file name labels
    ['incomeProofName', 'idProofName', 'supportingDocsName'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    goToStep(1);

    // Reload applications and navigate to the list
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
  setTimeout(() => toast.classList.remove('show'), 4000);
}
