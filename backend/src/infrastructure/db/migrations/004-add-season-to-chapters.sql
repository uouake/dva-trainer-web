-- Migration: Add season column to chapters
-- Created: 2024-02-11

-- Add season column with default value 1
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS season INTEGER DEFAULT 1;

-- Create index for season lookups
CREATE INDEX IF NOT EXISTS idx_chapters_season ON chapters(season);

-- Update existing chapters based on their number
-- Prologue (0) + Chapitres 1-5 + Epilogue (6) = Saison 1
UPDATE chapters SET season = 1 WHERE number <= 6;

-- Chapitres 7-11 = Saison 2 (si existants)
UPDATE chapters SET season = 2 WHERE number > 6;
