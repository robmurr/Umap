const pool = require('../../config/db');

/**
 * Users Repository
 * Handles all database operations for users
 */

class UsersRepository {
  /**
   * Create a new user
   * @param {Object} user - User data
   * @param {string} user.email - User email
   * @param {string} user.password_hash - Hashed password
   * @param {string} user.google_id - Optional Google OAuth ID
   * @returns {Promise<Object>} Created user
   */
  async create(user) {
    const { email, password_hash, google_id } = user;
    const query = `
      INSERT INTO users (email, password_hash, google_id)
      VALUES ($1, $2, $3)
      RETURNING id, email, google_id, created_at
    `;
    const result = await pool.query(query, [email, password_hash, google_id || null]);
    return result.rows[0];
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async getById(id) {
    const query = 'SELECT id, email, google_id, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object with password_hash or null
   */
  async getByEmail(email) {
    const query = 'SELECT id, email, password_hash, google_id, created_at FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Get user by Google ID
   * @param {string} googleId - Google OAuth ID
   * @returns {Promise<Object|null>} User object or null
   */
  async getByGoogleId(googleId) {
    const query = 'SELECT id, email, google_id, created_at FROM users WHERE google_id = $1';
    const result = await pool.query(query, [googleId]);
    return result.rows[0] || null;
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated user or null
   */
  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    values.push(id);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, google_id, created_at
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if user was deleted
   */
  async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Get all users (paginated)
   * @param {number} limit - Number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Array of users
   */
  async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT id, email, google_id, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Check if email exists
   * @param {string} email - User email
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email) {
    const query = 'SELECT COUNT(*) FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return parseInt(result.rows[0].count, 10) > 0;
  }

  /**
   * Get user count
   * @returns {Promise<number>} Total user count
   */
  async count() {
    const query = 'SELECT COUNT(*) FROM users';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = new UsersRepository();
