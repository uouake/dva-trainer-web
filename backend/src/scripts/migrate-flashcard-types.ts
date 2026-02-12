import { AppDataSource } from '../infrastructure/db/data-source';

const migrationSQL = `
-- Alter user_id column to accept text (GitHub IDs are strings, not UUIDs)
ALTER TABLE flashcard_progress 
  ALTER COLUMN user_id TYPE TEXT;

-- Alter flashcard_id column to accept text
ALTER TABLE flashcard_progress 
  ALTER COLUMN flashcard_id TYPE TEXT;
`;

async function runMigration() {
  console.log('🔄 Fixing flashcard_progress column types...');
  
  try {
    await AppDataSource.initialize();
    console.log('📊 Database connected');

    await AppDataSource.query(migrationSQL);
    console.log('✅ Column types updated successfully!');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

runMigration();
