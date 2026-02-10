-- ============================================================================
-- Migration 001: Add users table and auth support
-- ============================================================================
-- Purpose: Add GitHub OAuth authentication while maintaining backward 
--          compatibility with existing anonymous attempts.
-- 
-- Safety: This script is idempotent (can be run multiple times safely)
--         All ADD COLUMN use IF NOT EXISTS
--         All CREATE TABLE use IF NOT EXISTS
--         All CREATE INDEX use IF NOT EXISTS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create users table for GitHub OAuth authenticated users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id TEXT UNIQUE NOT NULL,
  email TEXT,
  username TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster GitHub ID lookups during login
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);

-- ----------------------------------------------------------------------------
-- 2. Add authentication tracking to attempts table
-- ----------------------------------------------------------------------------

-- auth_type: distinguishes anonymous vs authenticated attempts
-- Default 'anonymous' ensures all existing rows remain valid
ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS auth_type VARCHAR(20) DEFAULT 'anonymous';

-- github_user_id: links attempt to users table (NULL for anonymous)
-- Nullable to maintain backward compatibility
ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS github_user_id TEXT;

-- ----------------------------------------------------------------------------
-- 3. Create indexes for performance
-- ----------------------------------------------------------------------------

-- Index for filtering by auth type (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_attempts_auth_type ON attempts(auth_type);

-- Index for finding all attempts by a specific GitHub user
CREATE INDEX IF NOT EXISTS idx_attempts_github_user_id ON attempts(github_user_id);

-- ----------------------------------------------------------------------------
-- Verification queries (uncomment to run)
-- ----------------------------------------------------------------------------
/*
-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Check attempts table new columns
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'attempts' 
AND column_name IN ('auth_type', 'github_user_id');

-- Count anonymous vs authenticated attempts
SELECT auth_type, COUNT(*) 
FROM attempts 
GROUP BY auth_type;
*/

-- ============================================================================
-- End of Migration 001
-- ============================================================================
