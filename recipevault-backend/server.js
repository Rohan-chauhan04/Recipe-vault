// recipevault-backend/server.js
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const bodyParser = require('body-parser');
const bcrypt     = require('bcrypt');
require('dotenv').config();

const pool         = require('./db');
const recipeRoutes = require('./routes/recipes');      // <─ router file

const app  = express();
const PORT = process.env.PORT || 5000;

// ──────────────────────────  MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());

// serve static frontend files  http://localhost:5000/login.html  etc.
app.use(express.static(path.join(__dirname, '../frontend')));

// ──────────────────────────  API ROUTES
app.use('/api/recipes', recipeRoutes);                     // e.g. POST /recipes/add

// signup
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const dup = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (dup.rowCount) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1,$2,$3) RETURNING id, username, email',
      [username, email, hash]
    );
    res.status(201).json({ message: 'User created', user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ message: 'User not found' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)   return res.status(400).json({ message: 'Incorrect password' });

    res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// health‑check
app.get('/db-test', async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.json(rows);
  } catch (e) {
    res.status(500).send('Database error');
  }
});

// send login page at root
app.get('/', (_, res) =>
  res.sendFile(path.join(__dirname, '../frontend', 'login.html'))
);

// 404 fallback
app.use((_, res) => res.status(404).send('404 Not Found'));

// ──────────────────────────  START
app.listen(PORT, () => console.log(`🚀  http://localhost:${PORT}`));
