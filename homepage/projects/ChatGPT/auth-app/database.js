import { Pool } from 'pg';
import dotenv from 'dotenv'

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log("✅ Connexion à PostgreSQL réussie !"))
  .catch(err => console.error("❌ Connexion échouée :", err,));
  

export default pool