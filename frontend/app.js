// frontend/app.js

(function initAppHelpers() {
  function getApiBase() {
    const stored = localStorage.getItem('API_BASE');
    if (stored) return stored.replace(/\/$/, '');
    const meta = document.querySelector('meta[name="api-base"]');
    if (meta && meta.content) return meta.content.replace(/\/$/, '');
    return '';
  }

  window.apiUrl = function apiUrl(path) {
    const base = getApiBase();
    if (!path.startsWith('/')) return base + '/' + path;
    return base + path;
  };

  function setupNavbar() {
    const nav = document.querySelector('.navbar-nav');
    if (!nav) return;
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
      nav.innerHTML = `
        <li class="nav-item"><a class="nav-link" href="home.html">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="recipes.html">Browse</a></li>
        <li class="nav-item"><a class="nav-link" href="addRecipe.html">Add Recipe</a></li>
        <li class="nav-item"><a class="nav-link" href="#" id="logoutLink">Logout (${user.username})</a></li>
      `;
      const logout = document.getElementById('logoutLink');
      if (logout) logout.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedInUser');
        window.location.href = 'home.html';
      });
    } else {
      nav.innerHTML = `
        <li class="nav-item"><a class="nav-link" href="home.html">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="recipes.html">Browse</a></li>
        <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
        <li class="nav-item"><a class="nav-link" href="signUpPage.html">Signup</a></li>
      `;
    }
  }

  document.addEventListener('DOMContentLoaded', setupNavbar);
})();


