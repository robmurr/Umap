import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool using DATABASE_URL or individual connection params
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fallback to individual parameters if DATABASE_URL is not set
  ...(process.env.DATABASE_URL ? {} : {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'umap_db',
  }),
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  process.exit(1);
});

export default pool;
