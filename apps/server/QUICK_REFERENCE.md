# UMap Database Schema v1 - Quick Reference

## Files Created

```
apps/server/src/
├── config/
│   ├── schema.sql                          # Complete database schema
│   └── DATABASE.md                         # Full documentation
├── modules/
│   ├── users/
│   │   └── users.repository.js             # User CRUD operations
│   ├── venues/
│   │   └── venues.repository.js            # Venue CRUD + location queries
│   └── events/
│       ├── event-attendance.repository.js  # Check-in management
│       └── event-reactions.repository.js   # Sentiment/reaction tracking

Root:
├── SCHEMA_IMPLEMENTATION.md                # Implementation summary
└── INTEGRATION_GUIDE.md                    # Service & route examples
```

## Database Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **users** | User accounts | id, email, password_hash, google_id |
| **venues** | Physical locations | id, name, lat, lng |
| **events** | Events at venues | id, venue_id, name, lat, lng, start_time |
| **event_attendance** | Check-ins | id, user_id, event_id, checked_in_at (UNIQUE) |
| **event_reactions** | Sentiment | id, user_id, event_id, reaction (sad/neutral/happy/excited) |

## Repository Quick Access

### Import Repositories
```javascript
const usersRepo = require('./modules/users/users.repository');
const venuesRepo = require('./modules/venues/venues.repository');
const eventsRepo = require('./modules/events/events.repository');
const attendanceRepo = require('./modules/events/event-attendance.repository');
const reactionsRepo = require('./modules/events/event-reactions.repository');
```

### Common Operations

#### Users
```javascript
// Create
await usersRepo.create({ email: 'user@example.com', password_hash: 'hash' });

// Lookup
await usersRepo.getByEmail('user@example.com');
await usersRepo.getByGoogleId('google_123');

// Check existence
await usersRepo.emailExists('user@example.com');
```

#### Venues
```javascript
// Create
await venuesRepo.create({ name: 'Venue Name', lat: 40.75, lng: -73.99 });

// Search
await venuesRepo.getNearby(40.7128, -73.9352, 10); // 10 km radius
```

#### Events
```javascript
// Create
await eventsRepo.create({
  venue_id: 1,
  name: 'Event Name',
  lat: 40.75, lng: -73.99,
  start_time: new Date()
});

// Search
await eventsRepo.getEventsNearby(40.7128, -73.9352, 5000); // 5000 meters
```

#### Attendance (Check-ins)
```javascript
// Check in
await attendanceRepo.create({ user_id: 1, event_id: 5 });

// Verify
await attendanceRepo.isCheckedIn(1, 5); // true/false

// Get stats
await attendanceRepo.getAttendanceCount(5); // number
await attendanceRepo.getEventAttendees(5, 20, 0); // paginated list
await attendanceRepo.getAttendanceCounts([1, 2, 3]); // batch query
```

#### Reactions
```javascript
// Add/update reaction
await reactionsRepo.createOrUpdate({
  user_id: 1,
  event_id: 5,
  reaction: 'excited'
});

// Get sentiment summary
const summary = await reactionsRepo.getReactionSummary(5);
// { sad: 2, neutral: 5, happy: 15, excited: 42, total: 64 }

// Batch query
const summaries = await reactionsRepo.getReactionSummaries([1, 2, 3]);
```

## Setup Steps

1. **Apply schema to database:**
   ```bash
   psql -U postgres -d umap_db -f apps/server/src/config/schema.sql
   ```

2. **Verify connection:**
   ```bash
   node -e "const p = require('./apps/server/src/config/db'); p.query('SELECT NOW()', () => process.exit());"
   ```

3. **Use in code:**
   ```javascript
   const eventsRepo = require('./modules/events/events.repository');
   const nearby = await eventsRepo.getEventsNearby(40.7128, -73.9352, 5000);
   ```

## Key Features

✅ **Production Ready**
- Foreign key constraints
- CASCADE deletes
- UNIQUE constraints
- CHECK constraints

✅ **Performant**
- Spatial indexes (lat, lng)
- Temporal indexes (start_time)
- User/event relationship indexes
- All O(log n) queries

✅ **Feature Complete**
- User management
- Venue management
- Event discovery
- Attendance tracking
- Sentiment analysis

✅ **No External Dependencies**
- No PostGIS required
- Pure PostgreSQL
- Standard coordinates (DOUBLE PRECISION)
- Haversine formula for distance

## Constraints

### Unique Constraints
- `users(email)` - One account per email
- `event_attendance(user_id, event_id)` - Prevent duplicate check-ins
- `event_reactions(user_id, event_id)` - One reaction per user per event

### Check Constraints
- `event_reactions(reaction)` - Only: 'sad', 'neutral', 'happy', 'excited'

### Foreign Keys
- `events.venue_id` → `venues.id` (ON DELETE CASCADE)
- `event_attendance.user_id` → `users.id` (ON DELETE CASCADE)
- `event_attendance.event_id` → `events.id` (ON DELETE CASCADE)
- `event_reactions.user_id` → `users.id` (ON DELETE CASCADE)
- `event_reactions.event_id` → `events.id` (ON DELETE CASCADE)

## Indexes

```sql
idx_users_email                    -- Fast user lookup by email
idx_users_google_id                -- Fast OAuth ID lookup
idx_venues_location                -- Spatial queries
idx_events_location                -- Spatial queries
idx_events_start_time              -- Time-based queries
idx_events_end_time                -- Active event filtering
idx_events_venue_id                -- Event-venue relationships
idx_event_attendance_event_id      -- Find event attendees
idx_event_attendance_user_id       -- Find user's events
idx_event_reactions_event_id       -- Find event reactions
idx_event_reactions_user_id        -- Find user's reactions
```

## Coordinate System

- **Latitude**: -90 to +90 (North/South)
- **Longitude**: -180 to +180 (East/West)
- **Type**: DOUBLE PRECISION (64-bit, ~15 decimal places)
- **Accuracy**: ~1 meter precision for location queries
- **Distance Formula**: Haversine (great-circle distance)

## Pagination Pattern

All `getAll()` methods support pagination:
```javascript
// Get records 20-40 (page 2, 20 per page)
const limit = 20;
const offset = (page - 1) * limit; // offset = 20

const results = await repo.getAll(limit, offset);
```

## Error Handling

Repositories throw errors in these cases:
- Database constraint violations (e.g., duplicate email)
- Foreign key violations (e.g., invalid user_id)
- Invalid check constraints (e.g., invalid reaction)
- Connection errors

Wrap calls in try-catch:
```javascript
try {
  await attendanceRepo.create({ user_id: 1, event_id: 5 });
} catch (error) {
  console.error('Check-in failed:', error.message);
  // Handle: "User already checked in to this event"
}
```

## Next Steps

1. Create service layers for business logic
2. Create API routes with validation
3. Add authentication middleware
4. Add request validation
5. Add error handling
6. Add unit tests
7. Add migration system for schema updates

## Documentation Files

- **schema.sql** - Raw SQL for entire database
- **DATABASE.md** - Complete reference with examples
- **SCHEMA_IMPLEMENTATION.md** - What was implemented
- **INTEGRATION_GUIDE.md** - Service & route examples
- **This file** - Quick reference
