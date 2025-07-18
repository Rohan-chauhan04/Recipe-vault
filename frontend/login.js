// login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  // ─── Toast helper (same as addRecipe.js) ──────────────────────────
  function showToast(msg, success = true, delay = 2000) {
    const toast         = document.createElement('div');
    toast.textContent   = msg;
    toast.style.position       = 'fixed';
    toast.style.bottom         = '20px';
    toast.style.left           = '50%';
    toast.style.transform      = 'translateX(-50%)';
    toast.style.background     = success ? '#28a745' : '#dc3545';
    toast.style.color          = 'white';
    toast.style.padding        = '12px 24px';
    toast.style.borderRadius   = '8px';
    toast.style.boxShadow      = '0 2px 8px rgba(0,0,0,0.2)';
    toast.style.zIndex         = '9999';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), delay);
  }
  // ─────────────────────────────────────────────────────────────────

  try {
    const res = await fetch('/login', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
      // save user info then toast + redirect
      localStorage.setItem('loggedInUser', JSON.stringify(data.user));
      showToast('Login successful!');
      setTimeout(() => (window.location.href = 'home.html'), 2000);
    } else {
      showToast(data.message || 'Login failed', false);
    }
  } catch (err) {
    console.error(err);
    showToast('Network / server error', false);
  }
});
