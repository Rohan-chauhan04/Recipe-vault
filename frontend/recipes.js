let currentPage = 1;
const limit = 12;

document.addEventListener('DOMContentLoaded', () => {
  // Prefill filters from URL
  const params = new URLSearchParams(location.search);
  if (params.get('category')) document.getElementById('categorySelect').value = params.get('category');
  if (params.get('q')) document.getElementById('searchInput').value = params.get('q');
  if (params.get('cuisine')) document.getElementById('cuisineInput').value = params.get('cuisine');

  document.getElementById('applyFilters').addEventListener('click', () => {
    currentPage = 1;
    loadRecipes();
  });
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; loadRecipes(); }
  });
  document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++; loadRecipes();
  });

  loadRecipes();

  // If an id is present in URL, open the modal after initial load
  const idParam = params.get('id');
  if (idParam) {
    // slight delay to allow bootstrap to load
    setTimeout(() => openModal(idParam), 250);
  }
});

async function loadRecipes() {
  const q = document.getElementById('searchInput').value.trim();
  const category = document.getElementById('categorySelect').value;
  const cuisine = document.getElementById('cuisineInput').value.trim();

  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('page', String(currentPage));
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (cuisine) params.set('cuisine', cuisine);

  const res = await fetch(apiUrl(`/api/recipes?${params.toString()}`));
  const data = await res.json();

  const grid = document.getElementById('results');
  grid.innerHTML = '';

  if (!Array.isArray(data) || data.length === 0) {
    grid.innerHTML = '<div class="col-12 text-center text-muted">No recipes found.</div>';
  } else {
    data.forEach(r => grid.appendChild(renderCard(r)));
  }

  document.getElementById('pageInfo').innerText = `Page ${currentPage}`;
}

function renderCard(r) {
  const col = document.createElement('div');
  col.className = 'col-md-3 mb-4';
  const imgSrc = r.has_image ? apiUrl(`/api/recipes/${r.id}/image`) : (r.image_url || 'images/tea.jpg');
  col.innerHTML = `
    <div class="card recipe-card h-100">
      <img src="${imgSrc}" class="card-img-top" alt="${r.title}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${r.title}</h5>
        <div class="mb-2">
          ${r.category ? `<span class="badge badge-cat me-1">${r.category}</span>` : ''}
          ${r.cuisine ? `<span class="badge bg-light text-dark border">${r.cuisine}</span>` : ''}
        </div>
        <p class="card-text small flex-grow-1">${(r.description || '').slice(0, 120)}${(r.description || '').length > 120 ? '…' : ''}</p>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">By ${r.username || 'Unknown'}</small>
          <button class="btn btn-sm btn-outline-warning" data-id="${r.id}">View</button>
        </div>
      </div>
    </div>
  `;
  col.querySelector('button').addEventListener('click', () => openModal(r.id));
  return col;
}

async function openModal(id) {
  const res = await fetch(apiUrl(`/api/recipes/${id}`));
  const r = await res.json();
  document.getElementById('modalTitle').innerText = r.title;
  const imgSrc = r.has_image ? apiUrl(`/api/recipes/${r.id}/image`) : (r.image_url || 'images/tea.jpg');
  const img = document.getElementById('modalImage');
  img.src = imgSrc; img.alt = r.title;
  document.getElementById('modalDesc').innerText = r.description || '';
  document.getElementById('modalMeta').innerHTML = `
    <span class="badge badge-cat me-2">${r.category || 'Uncategorized'}</span>
    <span class="badge bg-light text-dark border me-2">${r.cuisine || 'General'}</span>
    <small class="text-muted">By ${r.username}</small>
  `;
  const ul = document.getElementById('modalIngredients');
  ul.innerHTML = '';
  (r.ingredients || []).forEach(i => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `${i.name}${i.quantity ? ` — ${i.quantity}` : ''}`;
    ul.appendChild(li);
  });

  const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
  modal.show();
}


