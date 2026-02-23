-- ============================================
-- UMap Database Schema v1 (without PostGIS)
-- ============================================
-- Production-ready schema for location-based event discovery app
-- Uses standard PostgreSQL DOUBLE PRECISION for coordinates

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  google_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id);

-- ============================================
-- Venues Table
-- ============================================
CREATE TABLE IF NOT EXISTS venues (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_venues_location ON venues (lat, lng);

-- ============================================
-- Events Table
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_location ON events (lat, lng);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events (start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events (end_time);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events (venue_id);

-- ============================================
-- Event Attendance Table
-- ============================================
CREATE TABLE IF NOT EXISTS event_attendance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_attendance_event_id ON event_attendance (event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_user_id ON event_attendance (user_id);

-- ============================================
-- Event Reactions Table
-- ============================================
CREATE TABLE IF NOT EXISTS event_reactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('sad', 'neutral', 'happy', 'excited')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_event_reactions_event_id ON event_reactions (event_id);
CREATE INDEX IF NOT EXISTS idx_event_reactions_user_id ON event_reactions (user_id);

-- ============================================
-- Sample Data (Optional)
-- ============================================
-- Insert sample venue:
-- INSERT INTO venues (name, description, lat, lng)
-- VALUES ('Madison Square Garden', 'World-class arena', 40.7505, -73.9934);

-- Insert sample event:
-- INSERT INTO events (venue_id, name, description, start_time, end_time, lat, lng)
-- VALUES (1, 'Concert', 'Music festival', NOW(), NOW() + INTERVAL '2 hours', 40.7505, -73.9934);

-- Insert sample user:
-- INSERT INTO users (email, password_hash) VALUES ('user@example.com', 'hashed_password_here');

-- ============================================
-- How to use:
-- ============================================
-- 1. Run this schema: psql -U postgres -d umap_db -f schema.sql
-- 2. Query nearby events:
--    SELECT e.*, v.name as venue_name
--    FROM events e
--    LEFT JOIN venues v ON e.venue_id = v.id
--    WHERE e.lat BETWEEN 40.5 AND 40.9
--      AND e.lng BETWEEN -74.2 AND -73.7
--    ORDER BY e.start_time;
