const pool = require('../../config/db');

/**
 * Event Reactions Repository
 * Handles user reactions (sad, neutral, happy, excited) to events
 */

class EventReactionsRepository {
  /**
   * Valid reaction types
   */
  static REACTIONS = ['sad', 'neutral', 'happy', 'excited'];

  /**
   * Create or update a reaction
   * @param {Object} reaction - Reaction data
   * @param {number} reaction.user_id - User ID
   * @param {number} reaction.event_id - Event ID
   * @param {string} reaction.reaction - Reaction type (sad|neutral|happy|excited)
   * @returns {Promise<Object>} Created/updated reaction
   */
  async createOrUpdate(reaction) {
    const { user_id, event_id, reaction: reactionType } = reaction;

    const query = `
      INSERT INTO event_reactions (user_id, event_id, reaction)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, event_id) DO UPDATE
      SET reaction = $3, created_at = CURRENT_TIMESTAMP
      RETURNING id, user_id, event_id, reaction, created_at
    `;
    const result = await pool.query(query, [user_id, event_id, reactionType]);
    return result.rows[0];
  }

  /**
   * Get reaction by ID
   * @param {number} id - Reaction ID
   * @returns {Promise<Object|null>} Reaction object or null
   */
  async getById(id) {
    const query = `
      SELECT id, user_id, event_id, reaction, created_at
      FROM event_reactions
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get user's reaction to an event
   * @param {number} userId - User ID
   * @param {number} eventId - Event ID
   * @returns {Promise<Object|null>} Reaction object or null
   */
  async getUserReaction(userId, eventId) {
    const query = `
      SELECT id, user_id, event_id, reaction, created_at
      FROM event_reactions
      WHERE user_id = $1 AND event_id = $2
    `;
    const result = await pool.query(query, [userId, eventId]);
    return result.rows[0] || null;
  }

  /**
   * Get all reactions for an event
   * @param {number} eventId - Event ID
   * @param {number} limit - Number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Array of reactions
   */
  async getEventReactions(eventId, limit = 100, offset = 0) {
    const query = `
      SELECT id, user_id, event_id, reaction, created_at
      FROM event_reactions
      WHERE event_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [eventId, limit, offset]);
    return result.rows;
  }

  /**
   * Get reaction summary for an event
   * @param {number} eventId - Event ID
   * @returns {Promise<Object>} Object with reaction counts
   */
  async getReactionSummary(eventId) {
    const query = `
      SELECT 
        reaction,
        COUNT(*) as count
      FROM event_reactions
      WHERE event_id = $1
      GROUP BY reaction
    `;
    const result = await pool.query(query, [eventId]);
    
    const summary = {
      sad: 0,
      neutral: 0,
      happy: 0,
      excited: 0,
      total: 0
    };

    result.rows.forEach(row => {
      summary[row.reaction] = parseInt(row.count, 10);
      summary.total += parseInt(row.count, 10);
    });

    return summary;
  }

  /**
   * Get reaction summaries for multiple events
   * @param {number[]} eventIds - Array of event IDs
   * @returns {Promise<Object>} Object mapping event IDs to reaction summaries
   */
  async getReactionSummaries(eventIds) {
    if (!eventIds || eventIds.length === 0) return {};

    const query = `
      SELECT 
        event_id,
        reaction,
        COUNT(*) as count
      FROM event_reactions
      WHERE event_id = ANY($1)
      GROUP BY event_id, reaction
    `;
    const result = await pool.query(query, [eventIds]);
    
    const summaries = {};
    eventIds.forEach(id => {
      summaries[id] = {
        sad: 0,
        neutral: 0,
        happy: 0,
        excited: 0,
        total: 0
      };
    });

    result.rows.forEach(row => {
      summaries[row.event_id][row.reaction] = parseInt(row.count, 10);
      summaries[row.event_id].total += parseInt(row.count, 10);
    });

    return summaries;
  }

  /**
   * Get user's reactions
   * @param {number} userId - User ID
   * @param {number} limit - Number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Array of user's reactions
   */
  async getUserReactions(userId, limit = 50, offset = 0) {
    const query = `
      SELECT id, user_id, event_id, reaction, created_at
      FROM event_reactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Delete a reaction
   * @param {number} id - Reaction ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    const query = 'DELETE FROM event_reactions WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Delete user's reaction to an event
   * @param {number} userId - User ID
   * @param {number} eventId - Event ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteUserReaction(userId, eventId) {
    const query = `
      DELETE FROM event_reactions
      WHERE user_id = $1 AND event_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [userId, eventId]);
    return result.rows.length > 0;
  }

  /**
   * Get all reactions (admin)
   * @param {number} limit - Number of records
   * @param {number} offset - Number of records to skip
   * @returns {Promise<Array>} Array of all reactions
   */
  async getAll(limit = 100, offset = 0) {
    const query = `
      SELECT id, user_id, event_id, reaction, created_at
      FROM event_reactions
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Check if reaction type is valid
   * @param {string} reaction - Reaction type
   * @returns {boolean} True if valid
   */
  static isValidReaction(reaction) {
    return EventReactionsRepository.REACTIONS.includes(reaction);
  }
}

module.exports = new EventReactionsRepository();
