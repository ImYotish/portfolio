// database.js
require('dotenv').config();
const { Pool } = require('pg');

// Connexion PostgreSQL avec Pool
const pool = new Pool({
  user:     process.env.PGUSER     || 'postgres',
  host:     process.env.PGHOST     || 'localhost',
  database: process.env.PGDATABASE || 'authapp',
  password: process.env.PGPASSWORD || '',
  port:     process.env.PGPORT     ? parseInt(process.env.PGPORT, 10) : 5432,
});

// Détection des erreurs de connexion
pool.on('error', (err) => {
  console.error('❌ Connexion PostgreSQL échouée :', err.message);
  process.exit(1);
});

module.exports = pool;