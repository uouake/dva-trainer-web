import 'dotenv/config';
import { DataSource } from 'typeorm';
import { makeTypeOrmOptions } from './typeorm.config';

// Migration script to add auth columns to attempts table
async function main() {
  const ds = new DataSource({
    ...makeTypeOrmOptions(),
    synchronize: false,
    logging: true,
  });

  await ds.initialize();
  console.log('DB connected. Running migration...');

  // Check if columns exist
  const columns = await ds.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'attempts'
  `);
  console.log('Existing columns:', columns.map((c: any) => c.column_name));

  // Add auth_type column if not exists
  const hasAuthType = columns.some((c: any) => c.column_name === 'auth_type');
  if (!hasAuthType) {
    try {
      await ds.query(`
        ALTER TABLE attempts 
        ADD COLUMN auth_type VARCHAR(20) DEFAULT 'anonymous'
      `);
      console.log('✓ auth_type column added');
    } catch (err) {
      console.error('Error adding auth_type:', err);
    }
  } else {
    console.log('✓ auth_type column already exists');
  }

  // Add github_user_id column if not exists
  const hasGithubUserId = columns.some((c: any) => c.column_name === 'github_user_id');
  if (!hasGithubUserId) {
    try {
      await ds.query(`
        ALTER TABLE attempts 
        ADD COLUMN github_user_id TEXT NULL
      `);
      console.log('✓ github_user_id column added');
    } catch (err) {
      console.error('Error adding github_user_id:', err);
    }
  } else {
    console.log('✓ github_user_id column already exists');
  }

  console.log('\n✅ Migration complete!');
  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
