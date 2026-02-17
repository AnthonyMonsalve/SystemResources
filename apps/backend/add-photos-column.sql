-- Migration: Add photos column to workout_sessions table
-- Run this SQL in your PostgreSQL database

ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workout_sessions'
AND column_name = 'photos';
