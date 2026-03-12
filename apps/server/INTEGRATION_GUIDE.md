/**
 * Integration Guide - Using Repositories in Services and Routes
 * 
 * This file shows how to create service layers and API routes
 * using the repository pattern for clean architecture.
 */

/**
 * ============================================
 * SERVICE LAYER EXAMPLE
 * ============================================
 */

// File: src/modules/events/event-attendance.service.js

const attendanceRepo = require('./event-attendance.repository');
const eventsRepo = require('./events.repository');

class EventAttendanceService {
  /**
   * Check user into an event
   * @param {number} userId - User ID
   * @param {number} eventId - Event ID
   * @returns {Promise<Object>} Attendance record with event details
   * @throws {Error} If user already checked in or event doesn't exist
   */
  async checkIn(userId, eventId) {
    // Verify event exists
    const event = await eventsRepo.getById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if already checked in
    const alreadyCheckedIn = await attendanceRepo.isCheckedIn(userId, eventId);
    if (alreadyCheckedIn) {
      throw new Error('User already checked in to this event');
    }

    // Create attendance record
    const attendance = await attendanceRepo.create({
      user_id: userId,
      event_id: eventId
    });

    return {
      ...attendance,
      event: {
        id: event.id,
        name: event.name,
        start_time: event.start_time
      }
    };
  }

  /**
   * Get event attendee list with pagination
   * @param {number} eventId - Event ID
   * @param {number} page - Page number (1-indexed)
   * @param {number} pageSize - Items per page
   * @returns {Promise<Object>} Paginated attendees
   */
  async getAttendees(eventId, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const attendees = await attendanceRepo.getEventAttendees(eventId, pageSize, offset);
    const count = await attendanceRepo.getAttendanceCount(eventId);

    return {
      attendees,
      pagination: {
        page,
        pageSize,
        total: count,
        pages: Math.ceil(count / pageSize)
      }
    };
  }

  /**
   * Check out user from event (remove attendance)
   * @param {number} userId - User ID
   * @param {number} eventId - Event ID
   * @returns {Promise<boolean>} True if checked out
   */
  async checkOut(userId, eventId) {
    return attendanceRepo.deleteUserEventAttendance(userId, eventId);
  }
}

module.exports = new EventAttendanceService();

/**
 * ============================================
 * ROUTE/API LAYER EXAMPLE
 * ============================================
 */

// File: src/modules/events/event-attendance.routes.js

const express = require('express');
const router = express.Router();
const attendanceService = require('./event-attendance.service');
const reactionsRepo = require('./event-reactions.repository');

// Middleware: Validate user ID (example)
const validateUserId = (req, res, next) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  req.userId = userId;
  next();
};

// Middleware: Validate event ID
const validateEventId = (req, res, next) => {
  const eventId = parseInt(req.params.eventId, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }
  req.eventId = eventId;
  next();
};

/**
 * POST /attendance/:userId/:eventId
 * Check user into an event
 */
router.post('/:userId/:eventId', validateUserId, validateEventId, async (req, res) => {
  try {
    const attendance = await attendanceService.checkIn(req.userId, req.eventId);
    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /attendance/:eventId/attendees
 * Get list of attendees for an event
 */
router.get('/:eventId/attendees', validateEventId, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;

    const result = await attendanceService.getAttendees(req.eventId, page, pageSize);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /attendance/:eventId/stats
 * Get event attendance stats with reaction summary
 */
router.get('/:eventId/stats', validateEventId, async (req, res) => {
  try {
    const attendanceCount = await attendanceRepo.getAttendanceCount(req.eventId);
    const reactionSummary = await reactionsRepo.getReactionSummary(req.eventId);

    res.json({
      success: true,
      data: {
        attendees: attendanceCount,
        reactions: reactionSummary,
        engagement_rate: reactionSummary.total > 0
          ? ((reactionSummary.total / attendanceCount) * 100).toFixed(1)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /attendance/:userId/:eventId
 * Remove user attendance from event
 */
router.delete('/:userId/:eventId', validateUserId, validateEventId, async (req, res) => {
  try {
    const success = await attendanceService.checkOut(req.userId, req.eventId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Checked out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

/**
 * ============================================
 * REACTIONS SERVICE & ROUTES EXAMPLE
 * ============================================
 */

// File: src/modules/events/event-reactions.service.js

const reactionsRepo = require('./event-reactions.repository');

class EventReactionsService {
  /**
   * Add or update user's reaction to event
   * @param {number} userId - User ID
   * @param {number} eventId - Event ID
   * @param {string} reaction - Reaction type
   * @returns {Promise<Object>} Updated reaction
   */
  async setReaction(userId, eventId, reaction) {
    if (!reactionsRepo.constructor.isValidReaction(reaction)) {
      throw new Error(`Invalid reaction type. Must be one of: sad, neutral, happy, excited`);
    }

    return reactionsRepo.createOrUpdate({
      user_id: userId,
      event_id: eventId,
      reaction
    });
  }

  /**
   * Get reaction sentiment analysis for an event
   * @param {number} eventId - Event ID
   * @returns {Promise<Object>} Sentiment analysis
   */
  async getEventSentiment(eventId) {
    const summary = await reactionsRepo.getReactionSummary(eventId);

    // Calculate sentiment score (-1 to 1)
    let sentimentScore = 0;
    if (summary.total > 0) {
      sentimentScore = (
        (summary.excited * 1.0 + summary.happy * 0.5 - summary.sad * 1.0 - summary.neutral * 0) /
        summary.total
      ).toFixed(2);
    }

    return {
      reactions: {
        excited: summary.excited,
        happy: summary.happy,
        neutral: summary.neutral,
        sad: summary.sad,
        total: summary.total
      },
      sentiment: sentimentScore,
      mood: this._getMoodLabel(sentimentScore)
    };
  }

  /**
   * Get sentiment for multiple events
   * @param {number[]} eventIds - Array of event IDs
   * @returns {Promise<Object>} Event IDs mapped to sentiment
   */
  async getEventsSentiment(eventIds) {
    const summaries = await reactionsRepo.getReactionSummaries(eventIds);
    const result = {};

    Object.entries(summaries).forEach(([eventId, summary]) => {
      let sentimentScore = 0;
      if (summary.total > 0) {
        sentimentScore = (
          (summary.excited * 1.0 + summary.happy * 0.5 - summary.sad * 1.0) /
          summary.total
        ).toFixed(2);
      }

      result[eventId] = {
        reactions: summary,
        sentiment: sentimentScore,
        mood: this._getMoodLabel(sentimentScore)
      };
    });

    return result;
  }

  _getMoodLabel(score) {
    if (score > 0.5) return 'Very Positive';
    if (score > 0.2) return 'Positive';
    if (score > -0.2) return 'Neutral';
    if (score > -0.5) return 'Negative';
    return 'Very Negative';
  }
}

module.exports = new EventReactionsService();

/**
 * ============================================
 * APP INTEGRATION
 * ============================================
 */

// File: src/app.js (main Express app)

const express = require('express');
const app = express();

// ... existing middleware ...

// Mount routes
const eventAttendanceRoutes = require('./modules/events/event-attendance.routes');
const eventsRoutes = require('./modules/events/events.routes');
const usersRoutes = require('./modules/users/users.routes');
const venuesRoutes = require('./modules/venues/venues.routes');

app.use('/api/attendance', eventAttendanceRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/venues', venuesRoutes);

module.exports = app;

/**
 * ============================================
 * API ENDPOINT EXAMPLES
 * ============================================
 */

/**
 * POST /api/attendance/:userId/:eventId
 * Check user into event
 * 
 * Request:
 *   POST /api/attendance/1/5
 * 
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "id": 42,
 *       "user_id": 1,
 *       "event_id": 5,
 *       "checked_in_at": "2026-02-22T10:30:00.000Z",
 *       "event": {
 *         "id": 5,
 *         "name": "Concert Night",
 *         "start_time": "2026-02-25T19:00:00.000Z"
 *       }
 *     }
 *   }
 */

/**
 * GET /api/attendance/5/attendees?page=1&pageSize=20
 * Get event attendees
 * 
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "attendees": [
 *         {
 *           "id": 1,
 *           "user_id": 1,
 *           "event_id": 5,
 *           "checked_in_at": "2026-02-22T10:30:00.000Z",
 *           "email": "user@example.com"
 *         }
 *       ],
 *       "pagination": {
 *         "page": 1,
 *         "pageSize": 20,
 *         "total": 42,
 *         "pages": 3
 *       }
 *     }
 *   }
 */

/**
 * GET /api/attendance/5/stats
 * Get attendance and reaction stats
 * 
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "attendees": 42,
 *       "reactions": {
 *         "excited": 20,
 *         "happy": 15,
 *         "neutral": 5,
 *         "sad": 2,
 *         "total": 42
 *       },
 *       "engagement_rate": "100.0"
 *     }
 *   }
 */

module.exports = {
  docInfo: 'Service and Route Integration Guide'
};
