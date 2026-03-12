/**
 * Database Schema Documentation - UMap v1
 * 
 * Complete guide to all tables, repositories, and usage patterns
 */

/**
 * ============================================
 * TABLE STRUCTURE
 * ============================================
 */

/**
 * USERS TABLE
 * Stores user account information
 * 
 * Fields:
 *  - id: SERIAL PRIMARY KEY
 *  - email: TEXT UNIQUE NOT NULL
 *  - password_hash: TEXT (nullable for OAuth)
 *  - google_id: TEXT (nullable, for OAuth integration)
 *  - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * 
 * Indexes:
 *  - idx_users_email (for fast lookups by email)
 *  - idx_users_google_id (for OAuth flow)
 * 
 * Repository: require('./modules/users/users.repository')
 */

/**
 * VENUES TABLE
 * Physical locations where events can be held
 * 
 * Fields:
 *  - id: SERIAL PRIMARY KEY
 *  - name: TEXT NOT NULL
 *  - description: TEXT
 *  - lat: DOUBLE PRECISION (latitude coordinate)
 *  - lng: DOUBLE PRECISION (longitude coordinate)
 *  - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * 
 * Indexes:
 *  - idx_venues_location (lat, lng for spatial queries)
 * 
 * Repository: require('./modules/venues/venues.repository')
 * Key Methods:
 *  - create(venue)
 *  - getById(id)
 *  - getNearby(lat, lng, radiusKm)
 *  - update(id, updates)
 *  - delete(id)
 */

/**
 * EVENTS TABLE
 * Individual events happening at venues or custom locations
 * 
 * Fields:
 *  - id: SERIAL PRIMARY KEY
 *  - venue_id: INTEGER REFERENCES venues(id) ON DELETE CASCADE (nullable)
 *  - name: TEXT NOT NULL
 *  - description: TEXT
 *  - start_time: TIMESTAMP
 *  - end_time: TIMESTAMP
 *  - lat: DOUBLE PRECISION (event location latitude)
 *  - lng: DOUBLE PRECISION (event location longitude)
 *  - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * 
 * Indexes:
 *  - idx_events_location (lat, lng for spatial queries)
 *  - idx_events_start_time (for chronological queries)
 *  - idx_events_end_time (for filtering active events)
 *  - idx_events_venue_id (for venue-event relationships)
 * 
 * Repository: require('./modules/events/events.repository')
 * Key Methods:
 *  - create(event)
 *  - getById(id)
 *  - getEventsNearby(lat, lng, radiusMeters)
 *  - getEventsByVenue(venueId)
 *  - update(id, updates)
 *  - delete(id)
 */

/**
 * EVENT_ATTENDANCE TABLE
 * Tracks which users have checked in to which events
 * 
 * Fields:
 *  - id: SERIAL PRIMARY KEY
 *  - user_id: INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
 *  - event_id: INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE
 *  - checked_in_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 *  - UNIQUE(user_id, event_id) - Prevents duplicate check-ins
 * 
 * Indexes:
 *  - idx_event_attendance_event_id (for finding attendees of an event)
 *  - idx_event_attendance_user_id (for finding events a user attends)
 * 
 * Repository: require('./modules/events/event-attendance.repository')
 * Key Methods:
 *  - create(attendance) - Check in user to event
 *  - isCheckedIn(userId, eventId) - Verify attendance
 *  - getEventAttendees(eventId, limit, offset)
 *  - getUserEvents(userId, limit, offset)
 *  - getAttendanceCount(eventId)
 *  - getAttendanceCounts(eventIds) - Batch query
 *  - deleteUserEventAttendance(userId, eventId)
 */

/**
 * EVENT_REACTIONS TABLE
 * Stores user sentiment reactions to events
 * 
 * Fields:
 *  - id: SERIAL PRIMARY KEY
 *  - user_id: INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
 *  - event_id: INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE
 *  - reaction: TEXT NOT NULL CHECK (reaction IN ('sad','neutral','happy','excited'))
 *  - created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 *  - UNIQUE(user_id, event_id) - One reaction per user per event
 * 
 * Indexes:
 *  - idx_event_reactions_event_id (for finding reactions to an event)
 *  - idx_event_reactions_user_id (for finding user's reactions)
 * 
 * Repository: require('./modules/events/event-reactions.repository')
 * Key Methods:
 *  - createOrUpdate(reaction) - Add or update reaction
 *  - getUserReaction(userId, eventId)
 *  - getEventReactions(eventId, limit, offset)
 *  - getReactionSummary(eventId) - Get counts by reaction type
 *  - getReactionSummaries(eventIds) - Batch query summaries
 *  - deleteUserReaction(userId, eventId)
 */

/**
 * ============================================
 * COMMON USAGE PATTERNS
 * ============================================
 */

/**
 * USERS REPOSITORY EXAMPLES
 */

// const usersRepo = require('./modules/users/users.repository');

// Create user
// const newUser = await usersRepo.create({
//   email: 'user@example.com',
//   password_hash: 'hashed_password',
//   google_id: null
// });

// Get user by email (for login)
// const user = await usersRepo.getByEmail('user@example.com');
// if (user && validatePassword(password, user.password_hash)) {
//   // Login successful
// }

// Get user by Google ID (for OAuth)
// const user = await usersRepo.getByGoogleId('google_id_123');

// Check if email exists
// const exists = await usersRepo.emailExists('user@example.com');

/**
 * VENUES REPOSITORY EXAMPLES
 */

// const venuesRepo = require('./modules/venues/venues.repository');

// Create venue
// const newVenue = await venuesRepo.create({
//   name: 'Madison Square Garden',
//   description: 'World-class arena',
//   lat: 40.7505,
//   lng: -73.9934
// });

// Find nearby venues
// const nearbyVenues = await venuesRepo.getNearby(40.7128, -73.9352, 5); // 5 km radius

/**
 * EVENTS REPOSITORY EXAMPLES
 */

// const eventsRepo = require('./modules/events/events.repository');

// Create event
// const newEvent = await eventsRepo.create({
//   venue_id: 1,
//   name: 'Concert Night',
//   description: 'Live music event',
//   start_time: new Date(),
//   end_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
//   lat: 40.7505,
//   lng: -73.9934
// });

// Find events nearby
// const nearbyEvents = await eventsRepo.getEventsNearby(40.7128, -73.9352, 5000); // 5000 meters

/**
 * EVENT ATTENDANCE REPOSITORY EXAMPLES
 */

// const attendanceRepo = require('./modules/events/event-attendance.repository');

// User checks in to event
// const attendance = await attendanceRepo.create({
//   user_id: 1,
//   event_id: 5
// });

// Check if user is already checked in
// const isCheckedIn = await attendanceRepo.isCheckedIn(1, 5);

// Get all attendees for an event
// const attendees = await attendanceRepo.getEventAttendees(5, 100, 0);

// Get all events a user is attending
// const events = await attendanceRepo.getUserEvents(1, 50, 0);

// Get attendance count for an event
// const count = await attendanceRepo.getAttendanceCount(5);

/**
 * EVENT REACTIONS REPOSITORY EXAMPLES
 */

// const reactionsRepo = require('./modules/events/event-reactions.repository');

// User adds reaction to event
// const reaction = await reactionsRepo.createOrUpdate({
//   user_id: 1,
//   event_id: 5,
//   reaction: 'excited'
// });

// Get reaction summary for event
// const summary = await reactionsRepo.getReactionSummary(5);
// Result: { sad: 2, neutral: 5, happy: 15, excited: 42, total: 64 }

// Get summaries for multiple events
// const summaries = await reactionsRepo.getReactionSummaries([5, 6, 7]);

/**
 * ============================================
 * SETUP INSTRUCTIONS
 * ============================================
 */

// 1. Run schema file:
//    psql -U postgres -d umap_db -f /path/to/schema.sql

// 2. Test connection:
//    node -e "const pool = require('./apps/server/src/config/db'); 
//             pool.query('SELECT NOW()', (err, res) => { 
//               console.log(err ? 'Error' : 'Connected'); 
//               process.exit();
//             });"

// 3. Insert sample data:
//    psql -U postgres -d umap_db -c "
//      INSERT INTO venues (name, lat, lng) VALUES ('Venue 1', 40.7505, -73.9934);
//      INSERT INTO users (email) VALUES ('user@example.com');
//      INSERT INTO events (name, lat, lng) VALUES ('Event 1', 40.7505, -73.9934);
//    "

// 4. Use repositories in your code:
//    const eventsRepo = require('./modules/events/events.repository');
//    const events = await eventsRepo.getEventsNearby(40.7128, -73.9352, 5000);

/**
 * ============================================
 * INDEXES REFERENCE
 * ============================================
 */

// For fast location-based queries:
// idx_users_email - O(1) user lookup by email
// idx_users_google_id - O(1) user lookup by Google ID
// idx_venues_location - O(log n) spatial queries
// idx_events_location - O(log n) spatial queries
// idx_events_start_time - O(log n) chronological queries
// idx_events_end_time - O(log n) active event queries
// idx_events_venue_id - O(log n) venue-event relationships
// idx_event_attendance_event_id - O(log n) find attendees
// idx_event_attendance_user_id - O(log n) find user's events
// idx_event_reactions_event_id - O(log n) find event reactions
// idx_event_reactions_user_id - O(log n) find user's reactions

module.exports = {
  docInfo: 'UMap Database Schema v1 Documentation'
};
