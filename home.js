// home.js

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const navbar = document.querySelector('.navbar-nav');
  if (user) {
    navbar.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="#">Welcome, ${user.username}</a></li>
      <li class="nav-item"><a class="nav-link" href="#" id="logout">Logout</a></li>
    `;

    document.getElementById('logout').addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.reload();
    });
  } else {
    // Optional: Redirect to login if not logged in
    // window.location.href = "loginPage.html";
  }
});
