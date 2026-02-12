-- Migration: Fix flashcard_progress column types for GitHub IDs
-- Created: 2024-02-12

-- Alter user_id column to accept text (GitHub IDs are strings, not UUIDs)
ALTER TABLE flashcard_progress 
  ALTER COLUMN user_id TYPE TEXT;

-- Alter flashcard_id column to accept text
ALTER TABLE flashcard_progress 
  ALTER COLUMN flashcard_id TYPE TEXT;
