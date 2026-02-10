// Jest E2E Setup
// This file runs before tests to set up the environment

// Set test environment
process.env.NODE_ENV = 'test';

// Set required environment variables for testing
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'test';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test';
process.env.DB_NAME = process.env.DB_NAME || 'dva_test';

// JWT configuration
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt-signing';

// GitHub OAuth (mock values for testing)
process.env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'test-client-id';
process.env.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'test-client-secret';
process.env.GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

// Set a longer timeout for E2E tests
jest.setTimeout(30000);
