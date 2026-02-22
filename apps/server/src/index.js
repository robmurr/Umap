import dotenv from 'dotenv';
import app from './app.js';
import pool from './config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;

// Test database connection on startup
async function startServer() {
  try {
    // Test the database connection
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully at:', result.rows[0].now);

    // Start the HTTP server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log(`✓ Events endpoint: http://localhost:${PORT}/events`);
    });
  } catch (error) {
    console.error('✗ Failed to connect to database:', error.message);
    process.exit(1);
  }
}

startServer();
