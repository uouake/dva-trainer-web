import 'dotenv/config';
import { DataSource } from 'typeorm';
import { makeTypeOrmOptions } from '../typeorm.config';

// This script creates the database schema for MVP.
//
// Why a script instead of migrations?
// - Our environment sometimes fails to spawn shell processes (EAGAIN) when running the TypeORM CLI.
// - This script runs inside Node directly and is therefore much more reliable.
//
// Later, when the MVP is validated, we can switch back to proper migrations.

async function main() {
  const opts = makeTypeOrmOptions();

  // For the schema creation script, we temporarily enable synchronize.
  // This will CREATE tables based on entities.
  // IMPORTANT: do not use synchronize=true in production.
  const ds = new DataSource({
    ...opts,
    synchronize: true,
    logging: false,
  });

  await ds.initialize();
  console.log('DB connected. Synchronizing schema...');
  await ds.synchronize();
  console.log('Schema synchronized.');
  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
