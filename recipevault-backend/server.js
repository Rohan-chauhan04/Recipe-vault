const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
require("dotenv").config();

const pool = require("./db");
const recipeRoutes = require("./routes/recipes");

const app = express();
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.use(
  cors({
    origin: [
      'http://localhost:5000',
      'http://127.0.0.1:5000',
    ],
  })
);
app.use(bodyParser.json({ limit: '6mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const pathLower = (req.path || '').toLowerCase();
  if (pathLower.startsWith('/hybridaction') || pathLower === '/favicon.ico') {
    return res.sendStatus(204);
  }
  return next();
});

app.all(/^\/hybridaction/i, (_req, res) => res.sendStatus(204));

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/recipes", recipeRoutes);

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      cuisine TEXT,
      image_data BYTEA,
      image_mime TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id SERIAL PRIMARY KEY,
      recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity TEXT
    )
  `);
  await pool.query(`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category TEXT`);
  await pool.query(`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cuisine TEXT`);
  await pool.query(`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS image_data BYTEA`);
  await pool.query(`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS image_mime TEXT`);
  await pool.query(`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL`);
}

// signup
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const dup = await pool.query("SELECT 1 FROM users WHERE email = $1", [
      email,
    ]);
    if (dup.rowCount)
      return res.status(400).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1,$2,$3) RETURNING id, username, email",
      [username, email, hash]
    );
    res.status(201).json({ message: "User created", user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = rows[0];
    if (!user) return res.status(400).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Incorrect password" });

    res.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// db-test
app.get("/db-test", async (_, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    res.json(rows);
  } catch (e) {
    res.status(500).send("Database error");
  }
});
// home.html
app.get("/", (_, res) =>
  res.sendFile(path.join(__dirname, "../frontend", "home.html"))
);
// 404
app.use((req, res) => {
  if ((req.path || '').startsWith('/api/')) {
    return res.status(404).json({ message: 'Not Found' });
  }
  return res.status(404).send('404 Not Found');
});
// server error
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if ((req.path || '').startsWith('/api/')) {
    return res.status(500).json({ message: 'Server error' });
  }
  return res.status(500).send('Server error');
});

ensureSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀  http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error('Schema ensure failed:', e);
    app.listen(PORT, () => console.log(`🚀  http://localhost:${PORT} (schema errors logged)`));
  });
