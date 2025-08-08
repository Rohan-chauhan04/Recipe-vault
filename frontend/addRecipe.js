// addRecipe.js
document.addEventListener("DOMContentLoaded", () => {
  // ───────────────────────────  Login guard
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    showToast("Please login first", false);
    setTimeout(() => (window.location.href = "loginPage.html"), 1500);
    return;
  }

  // ───────────────────────────  DOM refs
  const ingredientsContainer = document.getElementById("ingredientsContainer");
  const addIngredientBtn = document.getElementById("addIngredientBtn");
  const form = document.getElementById("recipeForm");

  // helper: create toast
  function showToast(msg, success = true) {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = success ? "#28a745" : "#dc3545"; // green or red
    toast.style.color = "white";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    toast.style.zIndex = "9999";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  // ───────────────────────────  Add ingredient row
  addIngredientBtn.addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "input-group mb-2 ingredient-row";
    row.innerHTML = `
      <input type="text" class="form-control ingredient-name" placeholder="Ingredient name" required>
      <input type="text" class="form-control ingredient-quantity" placeholder="Quantity" required>
      <button type="button" class="btn btn-danger remove-ingredient-btn">X</button>
    `;
    row.querySelector(".remove-ingredient-btn").onclick = () => row.remove();
    ingredientsContainer.appendChild(row);
  });

  // first row’s delete button
  ingredientsContainer.querySelector(".remove-ingredient-btn").onclick = (e) =>
    e.target.closest(".ingredient-row").remove();

  // ───────────────────────────  Handle form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("recipeTitle").value.trim();
    const description = document
      .getElementById("recipeDescription")
      .value.trim();

    // Collect ingredients
    const ingredients = [
      ...ingredientsContainer.querySelectorAll(".ingredient-row"),
    ]
      .map((row) => ({
        name: row.querySelector(".ingredient-name").value.trim(),
        quantity: row.querySelector(".ingredient-quantity").value.trim(),
      }))
      .filter((ing) => ing.name && ing.quantity);

    if (!ingredients.length) {
      showToast("Add at least one ingredient.", false);
      return;
    }

    const imageUrl = document.getElementById("recipeImage").value.trim();

    body: JSON.stringify({
      user_id: user.id,
      title,
      description,
      ingredients,
      image_url: imageUrl,
    });

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          title,
          description,
          ingredients,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("Recipe successfully added!");
        setTimeout(() => (window.location.href = "home.html"), 1000);
      } else {
        showToast(data.msg || data.message || "Failed to add recipe", false);
      }
    } catch (err) {
      showToast("Network/server error", false);
      console.error(err);
    }
  });
});
