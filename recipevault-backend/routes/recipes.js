const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/recipes – Add new recipe
router.post('/', async (req, res) => {
  const { title, description, image_url, ingredients, user_id } = req.body;
  
  if (!title || !user_id) {
    return res.status(400).json({ msg: 'title & user_id required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO recipes (title, description, image_url, user_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [title, description, image_url || null, user_id]
    );
    const recipeId = rows[0].id;

    if (Array.isArray(ingredients)) {
      const text = 'INSERT INTO ingredients (recipe_id, name, quantity) VALUES ($1, $2, $3)';
      for (const ing of ingredients) {
        await pool.query(text, [recipeId, ing.name, ing.quantity]);
      }
    }

    return res.status(201).json({ msg: 'Recipe added successfully', id: recipeId });
  } catch (err) {
    console.error('Error adding recipe:', err);
    res.status(500).send('Server error');
  }
});

// GET /api/recipes – Fetch first 4 recipes (newest first)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.title, r.description, u.username 
       FROM recipes r 
       JOIN users u ON r.user_id = u.id 
       ORDER BY r.id DESC
       LIMIT 4`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching recipes:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;