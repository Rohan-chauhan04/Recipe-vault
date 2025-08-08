Recipe Vault

A simple, good-looking recipe sharing web app where users/chefs can upload recipes with ingredients, categorize them (Dessert, Main Course, etc.), tag cuisines (Italian, Nepali, Indian, …), browse/filter recipes, and view featured recipes on the homepage. Images can be stored directly in PostgreSQL.

Tech stack
- Backend: Node.js, Express, PostgreSQL (pg), Multer (file uploads), Bcrypt (password hashing)
- Frontend: Static HTML/CSS, Bootstrap 5, Vanilla JS

Repo layout
```
Recipe-vault/
  frontend/                 # Static web app (served by Express)
    home.html, recipes.html, addRecipe.html, login.html, signUpPage.html
    home.js, recipes.js, addRecipe.js, login.js, signup.js, app.js
  recipevault-backend/      # Express + Postgres API
    server.js, db.js, routes/recipes.js, package.json
```

Prerequisites
- Node.js 18+ (Windows: use npm.cmd to avoid PowerShell policy issues)
- PostgreSQL 13+ running locally

Local setup (Windows / PowerShell)
1) Install backend dependencies
- Open PowerShell
- Change to backend folder, then install deps:
  ```powershell
  cd D:\sem5\dbms\Recipe-vault\recipevault-backend
  npm.cmd install
  ```

2) Configure PostgreSQL
- Create a database (e.g., recipevault) and a user with privileges.
- Create a .env in recipevault-backend/ with your local credentials:
  ```
  PGHOST=localhost
  PGPORT=5432
  PGDATABASE=recipevault
  PGUSER=postgres
  PGPASSWORD=your_password
  PGSSLMODE=disable
  ```

3) Start the server
- From recipevault-backend/:
  ```powershell
  npm.cmd run dev
  ```
- The server listens at http://localhost:5000 and serves the frontend from frontend/.

4) Open the app
- Go to http://localhost:5000/ (Home)
- Sign up, log in, browse recipes, and add your own.

Database schema
The server creates/ensures tables on startup, but you can also apply manually:
```
-- users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- recipes (image can be stored as BYTEA or referenced by URL)
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cuisine TEXT,
  image_url TEXT,
  image_data BYTEA,
  image_mime TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT
);

-- Optional indexes for faster filtering/search
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine);
```

Using the app
- Homepage
  - Hero CTA buttons
  - Featured Recipes (latest 4 from the database)
- Browse (recipes.html)
  - Filters: search (title/description), category, cuisine; pagination
  - Click View to open recipe details modal with ingredients
- Add Recipe (addRecipe.html)
  - Enter title, description, category, cuisine
  - Add any number of ingredients
  - Optional: image URL and/or image file (file stored as BYTEA in PostgreSQL)
- Auth
  - Sign up (signUpPage.html), then log in (login.html)

API quick reference
- POST /signup
  - JSON: { username, email, password }
  - Creates user, returns { user }
- POST /login
  - JSON: { email, password }
  - Returns { user } on success
- GET /api/recipes
  - Query: q, category, cuisine, limit, page
  - Returns recipe list with author username and has_image flag
- POST /api/recipes
  - Multipart form (supports file upload):
    - user_id (required)
    - title, description, category, cuisine, image_url (optional)
    - image (file, optional)
    - ingredients (JSON string array: [{ name, quantity }, ...])
- GET /api/recipes/:id
  - Returns details with aggregated ingredients
- GET /api/recipes/:id/image
  - Streams stored image bytes (BYTEA) if available
- GET /db-test
  - Health check (returns server time from DB)

Troubleshooting
- Port 5000 already in use
  - Either stop the process using it or change the port just for this session:
    ```powershell
    $env:PORT='5050'
    npm.cmd run dev
    ```
  - Then open http://localhost:5050/
- PowerShell execution policy blocks npm
  - Use npm.cmd install and npm.cmd run dev
- Cannot find module 'multer' or other missing modules
  - Run npm.cmd install in recipevault-backend/
- Database connection issues
  - Check http://localhost:5000/db-test
  - Verify .env values and that PostgreSQL is running
- Noisy console logs like /hybridaction/...
  - Caused by a browser extension; the server now swallows those, but for a clean console test in Incognito or disable the extension on localhost.

Notes on images in PostgreSQL
- If you select an image file in Add Recipe, it’s stored as BYTEA (image_data) with image_mime.
- Display order preference: stored image → image_url → a local placeholder.
- Images are served by /api/recipes/:id/image with correct Content-Type.

Development tips
- The frontend uses a small helper frontend/app.js to centralize API base and navbar state.
- All fetches go through apiUrl(path). For local use, you can keep it empty (same-origin calls).
- Avoid reformatting unrelated code; match the existing code style.

Future deployment (optional)
- This repo is set up for local hosting only.
- If you later deploy a serverless backend and a static frontend, point the frontend to the backend URL using a meta tag (name="api-base") or set localStorage.API_BASE in the browser.

Happy cooking!

