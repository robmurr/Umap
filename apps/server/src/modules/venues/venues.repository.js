const pool = require('../../config/db');

/**
 * Venues Repository
 * Handles all database operations for venues
 */

class VenuesRepository {
  /**
   * Create a new venue
   * @param {Object} venue - Venue data
   * @param {string} venue.name - Venue name
   * @param {string} venue.description - Venue description
   * @param {number} venue.lat - Latitude
   * @param {number} venue.lng - Longitude
   * @returns {Promise<Object>} Created venue
   */
  async create(venue) {
    const { name, description, lat, lng } = venue;
    const query = `
      INSERT INTO venues (name, description, lat, lng)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, lat, lng, created_at
    `;
    const result = await pool.query(query, [name, description, lat, lng]);
    return result.rows[0];
  }

  /**
   * Get venue by ID
   * @param {number} id - Venue ID
   * @returns {Promise<Object|null>} Venue object or null
   */
  async getById(id) {
    const query = 'SELECT id, name, description, lat, lng, created_at FROM venues WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all venues (paginated)
   * @param {number} limit - Number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Array of venues
   */
  async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT id, name, description, lat, lng, created_at
      FROM venues
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Get venues near a location
   * @param {number} lat - Center latitude
   * @param {number} lng - Center longitude
   * @param {number} radiusKm - Search radius in kilometers (default 10)
   * @returns {Promise<Array>} Array of nearby venues with distance
   */
  async getNearby(lat, lng, radiusKm = 10) {
    // Calculate rough bounding box (approximately)
    const latDelta = radiusKm / 111; // 1 degree latitude ≈ 111 km
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const query = `
      SELECT 
        id, name, description, lat, lng, created_at,
        ROUND(
          CAST(
            acos(
              sin(CAST($1 AS DOUBLE PRECISION) * PI() / 180) * 
              sin(lat * PI() / 180) + 
              cos(CAST($1 AS DOUBLE PRECISION) * PI() / 180) * 
              cos(lat * PI() / 180) * 
              cos((CAST($2 AS DOUBLE PRECISION) - lng) * PI() / 180)
            ) * 6371 AS numeric
          ), 2
        ) AS distance_km
      FROM venues
      WHERE lat BETWEEN ($1 - $3) AND ($1 + $3)
        AND lng BETWEEN ($2 - $4) AND ($2 + $4)
      ORDER BY distance_km ASC
    `;
    const result = await pool.query(query, [lat, lng, latDelta, lngDelta]);
    return result.rows;
  }

  /**
   * Update venue
   * @param {number} id - Venue ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated venue or null
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
      UPDATE venues
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, description, lat, lng, created_at
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete venue
   * @param {number} id - Venue ID
   * @returns {Promise<boolean>} True if venue was deleted
   */
  async delete(id) {
    const query = 'DELETE FROM venues WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Get venue count
   * @returns {Promise<number>} Total venue count
   */
  async count() {
    const query = 'SELECT COUNT(*) FROM venues';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = new VenuesRepository();
