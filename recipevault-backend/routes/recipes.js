const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, cuisine, user_id } = req.body;
    let ingredients = [];
    try {
      ingredients = typeof req.body.ingredients === 'string'
        ? JSON.parse(req.body.ingredients)
        : Array.isArray(req.body.ingredients)
          ? req.body.ingredients
          : [];
    } catch (_) {
      ingredients = [];
    }

    if (!title || !user_id) {
      return res.status(400).json({ msg: 'title & user_id required' });
    }

    const imageBuffer = req.file ? req.file.buffer : null;
    const imageMime = req.file ? req.file.mimetype : null;

    const insertRecipeQuery = `
      INSERT INTO recipes (title, description, category, cuisine, image_data, image_mime, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    const insertRecipeValues = [
      title,
      description || null,
      category || null,
      cuisine || null,
      imageBuffer,
      imageMime,
      user_id,
    ];

    const { rows } = await pool.query(insertRecipeQuery, insertRecipeValues);
    const recipeId = rows[0].id;

    if (Array.isArray(ingredients) && ingredients.length > 0) {
      const insertIngredientQuery = 'INSERT INTO ingredients (recipe_id, name, quantity) VALUES ($1, $2, $3)';
      for (const ing of ingredients) {
        if (!ing) continue;
        const name = ing.name || ing.ingredient || '';
        const quantity = ing.quantity || '';
        if (!name) continue;
        await pool.query(insertIngredientQuery, [recipeId, name, quantity]);
      }
    }

    return res.status(201).json({ msg: 'Recipe added successfully', id: recipeId });
  } catch (err) {
    console.error('Error adding recipe:', err.stack || err);
    return res.status(500).json({ message: 'Server error', details: String(err.message || err) });
  }
});

router.get('/', async (req, res) => {
  try {
    const { q, category, cuisine } = req.query;
    const limit = Math.min(parseInt(req.query.limit || '12', 10), 50);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const offset = (page - 1) * limit;

    const whereClauses = [];
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      whereClauses.push(`(r.title ILIKE $${params.length} OR r.description ILIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      whereClauses.push(`r.category = $${params.length}`);
    }
    if (cuisine) {
      params.push(cuisine);
      whereClauses.push(`r.cuisine = $${params.length}`);
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    params.push(limit);
    params.push(offset);

    const listQuery = `
      SELECT r.id, r.title, r.description, r.category, r.cuisine,
             (r.image_data IS NOT NULL) AS has_image,
             u.username
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      ${whereSQL}
      ORDER BY r.id DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const { rows } = await pool.query(listQuery, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching recipes:', err);
    res.status(500).json({ message: 'Server error', details: String(err.message || err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ msg: 'Invalid id' });

    const query = `
      SELECT r.id, r.title, r.description, r.category, r.cuisine,
             (r.image_data IS NOT NULL) AS has_image,
             u.username,
             COALESCE(json_agg(json_build_object('name', i.name, 'quantity', i.quantity)
               ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS ingredients
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN ingredients i ON i.recipe_id = r.id
      WHERE r.id = $1
      GROUP BY r.id, u.username
    `;
    const { rows } = await pool.query(query, [id]);
    const recipe = rows[0];
    if (!recipe) return res.status(404).json({ msg: 'Not found' });
    res.json(recipe);
  } catch (err) {
    console.error('Error fetching recipe by id:', err);
    res.status(500).json({ message: 'Server error', details: String(err.message || err) });
  }
});

router.get('/:id/image', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).send('Bad id');

    const { rows } = await pool.query(
      'SELECT image_data, image_mime FROM recipes WHERE id = $1',
      [id]
    );
    const row = rows[0];
    if (!row || !row.image_data) return res.status(404).send('No image');
    res.set('Content-Type', row.image_mime || 'application/octet-stream');
    res.send(row.image_data);
  } catch (err) {
    console.error('Error serving image:', err);
    res.status(500).json({ message: 'Server error', details: String(err.message || err) });
  }
});

module.exports = router;