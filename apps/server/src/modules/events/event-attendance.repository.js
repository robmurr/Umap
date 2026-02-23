const pool = require('../../config/db');

/**
 * Event Attendance Repository
 * Handles check-ins and attendance tracking for events
 */

class EventAttendanceRepository {
  /**
   * Create an attendance record (check-in)
   * @param {Object} attendance - Attendance data
   * @param {number} attendance.user_id - User ID
   * @param {number} attendance.event_id - Event ID
   * @returns {Promise<Object>} Created attendance record
   * @throws {Error} If user/event already checked in
   */
  async create(attendance) {
    const { user_id, event_id } = attendance;
    const query = `
      INSERT INTO event_attendance (user_id, event_id)
      VALUES ($1, $2)
      RETURNING id, user_id, event_id, checked_in_at
    `;
    const result = await pool.query(query, [user_id, event_id]);
    return result.rows[0];
  }

  /**
   * Get attendance record by ID
   * @param {number} id - Attendance ID
   * @returns {Promise<Object|null>} Attendance object or null
   */
  async getById(id) {
    const query = 'SELECT id, user_id, event_id, checked_in_at FROM event_attendance WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Check if user is already checked in to event
   * @param {number} userId - User ID
   * @param {number} eventId - Event ID
   * @returns {Promise<boolean>} True if already checked in
   */
  async isCheckedIn(userId, eventId) {
    const query = `
      SELECT COUNT(*) FROM event_attendance
      WHERE user_id = $1 AND event_id = $2
    `;
    const result = await pool.query(query, [userId, eventId]);
    return parseInt(result.rows[0].count, 10) > 0;
  }

  /**
   * Get all attendees for an event
   * @param {number} eventId - Event ID
   * @param {number} limit - Number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Array of attendees with user info
   */
  async getEventAttendees(eventId, limit = 100, offset = 0) {
    const query = `
      SELECT 
        ea.id, ea.user_id, ea.event_id, ea.checked_in_at,
        u.email, u.google_id
      FROM event_attendance ea
      JOIN users u ON ea.user_id = u.id
      WHERE ea.event_id = $1
      ORDER BY ea.checked_in_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [eventId, limit, offset]);
    return result.rows;
  }

  /**
   * Get all events a user is attending
   * @param {number} userId - User ID
   * @param {number} limit - Number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Array of events with attendance info
   */
  async getUserEvents(userId, limit = 50, offset = 0) {
    const query = `
      SELECT 
        e.id, e.name, e.description, e.start_time, e.end_time, 
        e.lat, e.lng, e.created_at, e.venue_id,
        ea.id as attendance_id, ea.checked_in_at
      FROM event_attendance ea
      JOIN events e ON ea.event_id = e.id
      WHERE ea.user_id = $1
      ORDER BY e.start_time DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Get attendance count for an event
   * @param {number} eventId - Event ID
   * @returns {Promise<number>} Number of attendees
   */
  async getAttendanceCount(eventId) {
    const query = 'SELECT COUNT(*) FROM event_attendance WHERE event_id = $1';
    const result = await pool.query(query, [eventId]);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get attendance counts for multiple events
   * @param {number[]} eventIds - Array of event IDs
   * @returns {Promise<Object>} Object mapping event IDs to attendance counts
   */
  async getAttendanceCounts(eventIds) {
    if (!eventIds || eventIds.length === 0) return {};

    const query = `
      SELECT event_id, COUNT(*) as count
      FROM event_attendance
      WHERE event_id = ANY($1)
      GROUP BY event_id
    `;
    const result = await pool.query(query, [eventIds]);
    const counts = {};
    result.rows.forEach(row => {
      counts[row.event_id] = parseInt(row.count, 10);
    });
    return counts;
  }

  /**
   * Delete attendance record (remove check-in)
   * @param {number} id - Attendance ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    const query = 'DELETE FROM event_attendance WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Delete user attendance for an event
   * @param {number} userId - User ID
   * @param {number} eventId - Event ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteUserEventAttendance(userId, eventId) {
    const query = 'DELETE FROM event_attendance WHERE user_id = $1 AND event_id = $2 RETURNING id';
    const result = await pool.query(query, [userId, eventId]);
    return result.rows.length > 0;
  }

  /**
   * Get all attendance records (admin)
   * @param {number} limit - Number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Array of attendance records
   */
  async getAll(limit = 100, offset = 0) {
    const query = `
      SELECT id, user_id, event_id, checked_in_at
      FROM event_attendance
      ORDER BY checked_in_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }
}

module.exports = new EventAttendanceRepository();
