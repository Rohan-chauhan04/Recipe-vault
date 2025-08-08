document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));

  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const navbar = document.querySelector('.navbar-nav');
  navbar.innerHTML = `
    <li class="nav-item"><a class="nav-link" href="#">Welcome, ${user.username}</a></li>
    <li class="nav-item"><a class="nav-link" href="#" id="logout">Logout</a></li>
  `;

  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
  });

  loadFeaturedRecipes();
});

async function loadFeaturedRecipes() {
  try {
    const res = await fetch('http://localhost:5000/api/recipes');
    const recipes = await res.json();
    console.log("Recipes:", recipes);

    const container = document.querySelector('#featured-recipes');
    container.innerHTML = '';

    if (recipes.length === 0) {
      container.innerHTML = `<p class="text-center text-muted">No recipes available yet.</p>`;
      return;
    }

    recipes.forEach(r => {
      // Use a default image since there's no image_url
      const imgSrc = 'images/tea.jpg'; // Make sure this image exists in your frontend
      
      container.innerHTML += `
        <div class="col-md-3">
          <div class="card recipe-card h-100">
            <img src="${imgSrc}" class="card-img-top" alt="${r.title}">
            <div class="card-body">
              <h5 class="card-title">${r.title}</h5>
              <p class="card-text">${r.description || 'No description provided'}</p>
              <small class="text-muted">By ${r.username || 'Unknown'}</small>
            </div>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error loading recipes:", error);
    document.querySelector('#featured-recipes').innerHTML = `
      <div class="col-12 text-center text-danger">
        Failed to load recipes. Please try again later.
      </div>
    `;
  }
}