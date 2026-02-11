import { AppDataSource } from '../infrastructure/db/data-source';

const migrationSQL = `
-- Add season column with default value 1
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS season INTEGER DEFAULT 1;

-- Create index for season lookups
CREATE INDEX IF NOT EXISTS idx_chapters_season ON chapters(season);

-- Update existing chapters based on their number
UPDATE chapters SET season = 1 WHERE number <= 6;
UPDATE chapters SET season = 2 WHERE number > 6;
`;

async function runMigration() {
  console.log('🔄 Adding season column to chapters...');
  
  try {
    await AppDataSource.initialize();
    console.log('📊 Database connected');

    await AppDataSource.query(migrationSQL);
    console.log('✅ Season column added successfully!');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

runMigration();
