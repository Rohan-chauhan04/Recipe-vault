const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// POST /recipes  – body = { title, description, ingredients:[{name,quantity}, …], user_id }
router.post('/', async (req, res) => {
  const { title, description, ingredients, user_id } = req.body;
  if (!title || !user_id) return res.status(400).json({ msg: 'title & user_id required' });

  try {
    // 1) insert recipe
    const { rows } = await pool.query(
      'INSERT INTO recipes (title, description, user_id) VALUES ($1,$2,$3) RETURNING id',
      [title, description, user_id]
    );
    const recipeId = rows[0].id;

    // 2) insert each ingredient
    if (Array.isArray(ingredients)) {
      const text = 'INSERT INTO ingredients (recipe_id,name,quantity) VALUES ($1,$2,$3)';
      for (const ing of ingredients) {
        await pool.query(text, [recipeId, ing.name, ing.quantity]);
      }
    }
    return res.status(201).json({ msg: 'Recipe added', id: recipeId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
