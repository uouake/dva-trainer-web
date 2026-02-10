import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration 001: Add users table and auth support to attempts
 * 
 * This migration adds:
 * 1. A new `users` table for GitHub OAuth authenticated users
 * 2. New columns to `attempts` table for auth tracking (backward compatible)
 * 
 * Backward compatibility strategy:
 * - Existing attempts with only userId continue to work
 * - New authType column defaults to 'anonymous' for all existing rows
 * - githubUserId is nullable, so old attempts don't need modification
 * - URLs with anonymous UUIDs continue to function unchanged
 */
export class AddUsersTable001 implements MigrationInterface {
  name = 'AddUsersTable001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table for GitHub OAuth
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        github_id TEXT UNIQUE NOT NULL,
        email TEXT,
        username TEXT,
        name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on github_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id)
    `);

    // Add auth_type column to attempts table (backward compatible)
    // Default 'anonymous' ensures all existing attempts remain valid
    await queryRunner.query(`
      ALTER TABLE attempts 
      ADD COLUMN IF NOT EXISTS auth_type VARCHAR(20) DEFAULT 'anonymous'
    `);

    // Add github_user_id column for linking to users table (nullable for backward compatibility)
    await queryRunner.query(`
      ALTER TABLE attempts 
      ADD COLUMN IF NOT EXISTS github_user_id TEXT
    `);

    // Create index on auth_type for filtering queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_attempts_auth_type ON attempts(auth_type)
    `);

    // Create index on github_user_id for user lookup
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_attempts_github_user_id ON attempts(github_user_id)
    `);

    console.log('✅ Migration 001 completed: users table created, attempts table updated');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes first
    await queryRunner.query(`DROP INDEX IF EXISTS idx_attempts_github_user_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_attempts_auth_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_github_id`);

    // Remove columns from attempts
    await queryRunner.query(`ALTER TABLE attempts DROP COLUMN IF EXISTS github_user_id`);
    await queryRunner.query(`ALTER TABLE attempts DROP COLUMN IF EXISTS auth_type`);

    // Drop users table
    await queryRunner.query(`DROP TABLE IF EXISTS users`);

    console.log('⏪ Migration 001 rolled back: users table dropped, attempts columns removed');
  }
}
