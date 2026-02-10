import 'dotenv/config';
import { DataSource } from 'typeorm';
import { makeTypeOrmOptions } from './typeorm.config';

// Migration script to add auth columns to attempts table
async function main() {
  const ds = new DataSource({
    ...makeTypeOrmOptions(),
    synchronize: false,
    logging: false,
  });

  await ds.initialize();
  console.log('DB connected. Running migration...');

  // Add authType column if not exists
  try {
    await ds.query(`
      ALTER TABLE attempts 
      ADD COLUMN IF NOT EXISTS auth_type VARCHAR(20) DEFAULT 'anonymous'
    `);
    console.log('✓ auth_type column added');
  } catch (err) {
    console.error('Error adding auth_type:', err);
  }

  // Add githubUserId column if not exists
  try {
    await ds.query(`
      ALTER TABLE attempts 
      ADD COLUMN IF NOT EXISTS github_user_id TEXT NULL
    `);
    console.log('✓ github_user_id column added');
  } catch (err) {
    console.error('Error adding github_user_id:', err);
  }

  console.log('\n✅ Migration complete!');
  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
