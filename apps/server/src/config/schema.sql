-- ============================================
-- Events Table Schema (without PostGIS)
-- ============================================
-- This simplified version uses standard PostgreSQL
-- without the PostGIS extension. For production,
-- you should install PostGIS for true spatial queries.

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_location ON events (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events (start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events (end_time);

-- ============================================
-- How to use:
-- ============================================
-- 1. Run this schema: psql -U postgres -d umap_db -f schema.sql
-- 2. Insert sample event:
--    INSERT INTO events (name, description, start_time, end_time, latitude, longitude)
--    VALUES ('Concert', 'Music festival', NOW(), NOW() + INTERVAL '2 hours', 34.0522, -118.2437);
-- 3. Query nearby events:
--    SELECT * FROM events
--    WHERE latitude BETWEEN 33.9522 AND 34.1522
--      AND longitude BETWEEN -118.3437 AND -118.1437
--    ORDER BY latitude, longitude;
-- 
-- For more advanced spatial queries, install PostGIS:
--    CREATE EXTENSION IF NOT EXISTS postgis;
