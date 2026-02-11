-- Migration: Create flashcards tables
-- Created: 2024-02-11

-- Flashcards table: stores AWS concept flashcards
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_key TEXT NOT NULL UNIQUE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for concept key lookups
CREATE INDEX IF NOT EXISTS idx_flashcards_concept_key ON flashcards(concept_key);
CREATE INDEX IF NOT EXISTS idx_flashcards_category ON flashcards(category);

-- Flashcard progress table: tracks user learning progress
CREATE TABLE IF NOT EXISTS flashcard_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    known BOOLEAN DEFAULT FALSE,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_reviewed_at TIMESTAMPTZ,
    UNIQUE(user_id, flashcard_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_id ON flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_flashcard_id ON flashcard_progress(flashcard_id);
