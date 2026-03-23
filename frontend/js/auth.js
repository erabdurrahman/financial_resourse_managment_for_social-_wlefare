/**
 * auth.js – Login / Register page logic
 * Handles tab switching, form submission, JWT storage, and role-based redirect
 */

// ── Redirect if already authenticated ─────────────────────────────────────
(function checkExistingSession() {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');
  if (token && user) {
    redirectByRole(user.role);
  }
})();

/** Redirect user to their role-specific dashboard */
function redirectByRole(role) {
  const routes = {
    admin:        '/admin.html',
    donor:        '/donor.html',
    beneficiary:  '/beneficiary.html'
  };
  window.location.href = routes[role] || '/';
}

// ── Login form handler ─────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn      = document.getElementById('loginBtn');
  const errEl    = document.getElementById('loginError');

  // Clear previous error
  errEl.textContent = '';

  // Basic client-side validation
  if (!email || !password) {
    errEl.textContent = 'Please enter your email and password.';
    return;
  }

  setLoading(btn, true);

  try {
    const res  = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.message || 'Login failed. Please try again.';
      return;
    }

    // Persist token and user profile in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));

    redirectByRole(data.user.role);

  } catch (err) {
    errEl.textContent = 'Network error. Please check your connection.';
  } finally {
    setLoading(btn, false);
  }
}

// ── Register form handler ──────────────────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();

  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const role     = document.getElementById('regRole').value;
  const btn      = document.getElementById('registerBtn');
  const errEl    = document.getElementById('registerError');

  errEl.textContent = '';

  // Validation
  if (!name || !email || !password || !role) {
    errEl.textContent = 'All fields are required.';
    return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    return;
  }
  if (!isValidEmail(email)) {
    errEl.textContent = 'Please enter a valid email address.';
    return;
  }

  setLoading(btn, true);

  try {
    const res  = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.message || 'Registration failed. Please try again.';
      return;
    }

    // Auto-login after successful registration
    const loginRes  = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();

    if (loginRes.ok) {
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user',  JSON.stringify(loginData.user));
      redirectByRole(loginData.user.role);
    } else {
      // Registration succeeded but auto-login failed: switch to login tab
      errEl.textContent = 'Account created! Please log in.';
      document.getElementById('tab-register').classList.remove('active');
      document.getElementById('tab-login').classList.add('active');
      document.querySelectorAll('.tab-btn')[0].classList.add('active');
      document.querySelectorAll('.tab-btn')[1].classList.remove('active');
    }
  } catch (err) {
    errEl.textContent = 'Network error. Please check your connection.';
  } finally {
    setLoading(btn, false);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Toggle loading state on submit button */
function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}

/** Basic email format validation */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
