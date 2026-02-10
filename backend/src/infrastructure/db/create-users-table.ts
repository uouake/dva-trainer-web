import 'dotenv/config';
import { DataSource } from 'typeorm';
import { makeTypeOrmOptions } from './typeorm.config';

// Create schema script: ensures all tables exist.
// Safe to run multiple times (uses IF NOT EXISTS).

async function main() {
  const ds = new DataSource({
    ...makeTypeOrmOptions(),
    synchronize: false, // We handle schema creation manually
    logging: false,
  });

  await ds.initialize();
  console.log('DB connected. Creating schema...');

  // Create users table
  await ds.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      github_id TEXT UNIQUE NOT NULL,
      username TEXT,
      name TEXT,
      email TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✓ users table created');

  console.log('\n✅ Schema creation complete!');
  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
