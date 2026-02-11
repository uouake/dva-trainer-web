-- Migration: Create chapters and user_chapter_progress tables
-- Created: 2024-02-10

-- Chapters table: stores manga story chapters
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    concept_keys TEXT[] DEFAULT '{}',
    "order" INTEGER DEFAULT 0,
    type TEXT DEFAULT 'chapter',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters("order");
CREATE INDEX IF NOT EXISTS idx_chapters_number ON chapters(number);

-- User chapter progress table: tracks user reading progress
CREATE TABLE IF NOT EXISTS user_chapter_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ,
    quiz_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, chapter_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_chapter_progress_user_id ON user_chapter_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chapter_progress_chapter_id ON user_chapter_progress(chapter_id);
