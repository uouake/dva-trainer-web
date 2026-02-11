import { AppDataSource } from '../infrastructure/db/data-source';

const migrationSQL = `
-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_key TEXT NOT NULL UNIQUE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flashcards_concept_key ON flashcards(concept_key);
CREATE INDEX IF NOT EXISTS idx_flashcards_category ON flashcards(category);

-- Create flashcard_progress table
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

CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_id ON flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_flashcard_id ON flashcard_progress(flashcard_id);
`;

async function runMigration() {
  console.log('🔄 Running flashcards migration...');
  
  try {
    await AppDataSource.initialize();
    console.log('📊 Database connected');

    await AppDataSource.query(migrationSQL);
    console.log('✅ Flashcards tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

runMigration();
