document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    const response = await fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const result = await response.json();
    alert(result.message);

    if (response.ok) {
      window.location.href = 'home.html';
    }
  } catch (err) {
    alert("Signup failed. Check your server or internet.");
    console.error("Signup Error:", err);
  }
});
