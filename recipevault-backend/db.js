const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase to handle SSL without strict cert validation
});

module.exports = pool;