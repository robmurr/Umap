import pool from '../../config/db.js';

/**
 * Get events near a specified location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusMeters - Search radius in meters
 * @returns {Promise<Array>} Array of nearby events with location coordinates
 */
async function getEventsNearby(lat, lng, radiusMeters) {
  const query = `
    SELECT
      id,
      name,
      description,
      start_time,
      end_time,
      latitude,
      longitude
    FROM events
    WHERE latitude BETWEEN $1 - ($3 / 111000.0)
      AND $1 + ($3 / 111000.0)
      AND longitude BETWEEN $2 - ($3 / (111000.0 * COS(RADIANS($1))))
      AND $2 + ($3 / (111000.0 * COS(RADIANS($1))))
    ORDER BY (($1 - latitude) * ($1 - latitude) + ($2 - longitude) * ($2 - longitude)) ASC
    LIMIT 100;
  `;

  try {
    const result = await pool.query(query, [lat, lng, radiusMeters]);
    return result.rows;
  } catch (error) {
    console.error('Error querying nearby events:', error);
    throw new Error('Failed to fetch nearby events');
  }
}

export { getEventsNearby };
