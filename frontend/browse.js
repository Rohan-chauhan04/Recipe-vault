document.addEventListener('DOMContentLoaded', async () => {
  console.log('Browse page initialized');
  
  // Check authentication
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  // Set up logout
  document.getElementById('logout').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
  });
  
  // Initial load
  await loadRecipes(1);
});

let currentPage = 1;
let totalPages = 1;

async function loadRecipes(page = 1) {
  console.log(`Loading page ${page}`);
  const container = document.getElementById('recipes-container');
  const loading = document.getElementById('loadingIndicator');
  const pagination = document.getElementById('pagination');
  
  // Show loading, hide pagination
  loading.style.display = 'block';
  pagination.style.display = 'none';
  container.innerHTML = '';
  
  try {
    const response = await fetch(`http://localhost:5000/api/recipes?page=${page}&limit=8`);
    console.log('Fetching recipes from:', response.url);
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status} status`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    // Hide loading
    loading.style.display = 'none';
    
    if (!data.recipes || data.recipes.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-utensils fa-3x text-muted mb-3"></i>
          <h4>No recipes found</h4>
          <p class="text-muted">Be the first to add a recipe!</p>
          <a href="add-recipe.html" class="btn btn-primary mt-2">
            <i class="fas fa-plus"></i> Add Recipe
          </a>
        </div>
      `;
      return;
    }
    
    // Display recipes
    container.innerHTML = data.recipes.map(recipe => `
      <div class="col-md-3 mb-4">
        <div class="card recipe-card h-100">
          <div style="height: 180px; overflow: hidden;">
            <img src="images/recipe-default.jpg" 
                 class="card-img-top h-100 w-100"
                 style="object-fit: cover;"
                 alt="${recipe.title}"
                 onerror="this.onerror=null;this.src='images/recipe-default.jpg'">
          </div>
          <div class="card-body">
            <h5 class="card-title">${recipe.title}</h5>
            <p class="card-text">${recipe.description || 'No description available'}</p>
            <small class="text-muted">By ${recipe.username || 'Anonymous'}</small>
          </div>
          <div class="card-footer bg-transparent">
            <a href="recipe-detail.html?id=${recipe.id}" class="btn btn-primary btn-sm w-100">
              <i class="fas fa-book-open me-1"></i> View Recipe
            </a>
          </div>
        </div>
      </div>
    `).join('');
    
    // Update pagination
    if (data.pagination) {
      currentPage = page;
      totalPages = data.pagination.pages;
      renderPagination(data.pagination);
      pagination.style.display = 'flex';
    }
    
  } catch (error) {
    console.error('Error loading recipes:', error);
    loading.style.display = 'none';
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
        <h4>Failed to load recipes</h4>
        <p>${error.message}</p>
        <button onclick="loadRecipes(${currentPage})" class="btn btn-primary mt-2">
          <i class="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    `;
  }
}

function renderPagination(pagination) {
  const container = document.getElementById('pagination');
  container.innerHTML = '';
  
  if (pagination.pages <= 1) return;
  
  // Previous button
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevLi.innerHTML = `
    <a class="page-link" href="#" aria-label="Previous">
      <span aria-hidden="true">&laquo;</span>
    </a>
  `;
  prevLi.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) loadRecipes(currentPage - 1);
  });
  container.appendChild(prevLi);
  
  // Page numbers
  for (let i = 1; i <= pagination.pages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', (e) => {
      e.preventDefault();
      loadRecipes(i);
    });
    container.appendChild(li);
  }
  
  // Next button
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${currentPage === pagination.pages ? 'disabled' : ''}`;
  nextLi.innerHTML = `
    <a class="page-link" href="#" aria-label="Next">
      <span aria-hidden="true">&raquo;</span>
    </a>
  `;
  nextLi.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage < pagination.pages) loadRecipes(currentPage + 1);
  });
  container.appendChild(nextLi);
}