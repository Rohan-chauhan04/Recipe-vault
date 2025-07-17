// home.js
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser')); // changed key from 'user' to 'loggedInUser'

  const navbar = document.querySelector('.navbar-nav');
  if (user) {
    navbar.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="#">Welcome, ${user.username}</a></li>
      <li class="nav-item"><a class="nav-link" href="#" id="logout">Logout</a></li>
    `;

    document.getElementById('logout').addEventListener('click', () => {
      localStorage.removeItem('loggedInUser');
      window.location.href = 'login.html';
    });
  }
});
if (!user) {
  window.location.href = 'login.html';
}
