# UMap Database Schema v1 - Implementation Summary

## ✅ Complete

### SQL Schema (`schema.sql`)
- [x] **users** table with email, password_hash, google_id, created_at
- [x] **venues** table with lat/lng location data
- [x] **events** table with venue_id reference and coordinates
- [x] **event_attendance** table with unique constraint on (user_id, event_id)
- [x] **event_reactions** table with CHECK constraint for reaction types
- [x] All indexes for optimal query performance
- [x] Production-ready with proper constraints and cascading deletes

### Repository Layer (JavaScript)

#### users.repository.js
```javascript
Methods:
✓ create(user)
✓ getById(id)
✓ getByEmail(email)
✓ getByGoogleId(googleId)
✓ update(id, updates)
✓ delete(id)
✓ getAll(limit, offset)
✓ emailExists(email)
✓ count()
```

#### venues.repository.js
```javascript
Methods:
✓ create(venue)
✓ getById(id)
✓ getAll(limit, offset)
✓ getNearby(lat, lng, radiusKm) - Uses Haversine formula
✓ update(id, updates)
✓ delete(id)
✓ count()
```

#### event-attendance.repository.js
```javascript
Methods:
✓ create(attendance) - Check-in with duplicate prevention
✓ getById(id)
✓ isCheckedIn(userId, eventId)
✓ getEventAttendees(eventId, limit, offset) - With user info
✓ getUserEvents(userId, limit, offset) - User's attended events
✓ getAttendanceCount(eventId)
✓ getAttendanceCounts(eventIds) - Batch query
✓ delete(id)
✓ deleteUserEventAttendance(userId, eventId)
✓ getAll(limit, offset)
```

#### event-reactions.repository.js
```javascript
Methods:
✓ createOrUpdate(reaction) - Upsert pattern for reactions
✓ getById(id)
✓ getUserReaction(userId, eventId)
✓ getEventReactions(eventId, limit, offset)
✓ getReactionSummary(eventId) - Returns { sad, neutral, happy, excited, total }
✓ getReactionSummaries(eventIds) - Batch query summaries
✓ getUserReactions(userId, limit, offset)
✓ delete(id)
✓ deleteUserReaction(userId, eventId)
✓ getAll(limit, offset)
✓ isValidReaction(reaction) - Static helper
```

### Documentation
- [x] Complete DATABASE.md with usage examples
- [x] All table structures documented
- [x] Common usage patterns explained
- [x] Setup instructions included

## File Structure

```
apps/server/src/
├── config/
│   ├── schema.sql          ← Main database schema
│   └── DATABASE.md         ← Complete documentation
├── modules/
│   ├── users/
│   │   └── users.repository.js
│   ├── venues/
│   │   └── venues.repository.js
│   └── events/
│       ├── event-attendance.repository.js
│       └── event-reactions.repository.js
```

## Key Features

### 🔒 Data Integrity
- Foreign key constraints with CASCADE deletes
- UNIQUE constraints prevent duplicates
- CHECK constraints enforce valid reaction types

### ⚡ Performance
- Spatial indexes on (lat, lng) for location queries
- Temporal indexes on start_time, end_time
- User/Event relationship indexes for fast lookups
- All O(log n) queries with proper indexing

### 📍 Spatial Queries (No PostGIS)
- Haversine formula for distance calculations
- Bounding box queries with indexed columns
- getNearby() and getReactionSummaries() support batch operations

### 🔄 Relationships
- Events can be linked to Venues (optional)
- Users can attend multiple events
- Users can react to multiple events
- Proper cascade behavior on deletions

## How to Use

### 1. Apply the Schema
```bash
psql -U postgres -d umap_db -f /path/to/apps/server/src/config/schema.sql
```

### 2. Use Repositories in Your Code
```javascript
const usersRepo = require('./modules/users/users.repository');
const eventsRepo = require('./modules/events/events.repository');
const attendanceRepo = require('./modules/events/event-attendance.repository');
const reactionsRepo = require('./modules/events/event-reactions.repository');
const venuesRepo = require('./modules/venues/venues.repository');

// Example: Create event and get nearby
const event = await eventsRepo.create({
  venue_id: 1,
  name: 'Concert Night',
  lat: 40.7505,
  lng: -73.9934,
  start_time: new Date()
});

const nearbyEvents = await eventsRepo.getEventsNearby(40.7128, -73.9352, 5000);
```

### 3. Create Service/Route Layers
Services should use these repositories to implement business logic:
- Authentication service (users)
- Event discovery service (events + venues)
- Attendance tracking service (event_attendance)
- Sentiment analysis service (event_reactions)

## Next Steps

1. **Create Service Layers** - Wrap repositories with business logic
2. **Create API Routes** - Expose repositories via REST endpoints
3. **Add Validation** - Input validation for all create/update operations
4. **Add Error Handling** - Proper error codes and messages
5. **Add Migrations** - For future schema changes
6. **Add Tests** - Unit tests for all repository methods

## Notes

- All coordinates use DOUBLE PRECISION (64-bit floating point)
- No PostGIS extension required - uses standard SQL
- Reaction types are limited to: 'sad', 'neutral', 'happy', 'excited'
- All timestamps default to CURRENT_TIMESTAMP
- Cascading deletes ensure referential integrity
- All repositories are singleton instances
