document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedRecipes();
});

async function loadFeaturedRecipes() {
  try {
    const res = await fetch(apiUrl('/api/recipes?limit=4'));
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || `Failed with ${res.status}`);
    }
    const recipes = await res.json();
    console.log("Recipes:", recipes);

    const container = document.querySelector('#featured-recipes');
    container.innerHTML = '';

    if (recipes.length === 0) {
      container.innerHTML = `<p class="text-center text-muted">No recipes available yet.</p>`;
      return;
    }

    recipes.forEach(r => {
      const imgSrc = r.has_image ? apiUrl(`/api/recipes/${r.id}/image`) : (r.image_url || 'images/tea.jpg');
      container.innerHTML += `
        <div class="col-md-3 mb-4">
          <div class="card recipe-card h-100">
            <img src="${imgSrc}" class="card-img-top" alt="${r.title}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${r.title}</h5>
              <p class="card-text small flex-grow-1">${r.description || 'No description provided'}</p>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">By ${r.username || 'Unknown'}</small>
                <a href="recipes.html?id=${r.id}" class="btn btn-sm btn-outline-warning">View</a>
              </div>
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