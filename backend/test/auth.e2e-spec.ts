import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { UserEntity } from '../src/infrastructure/db/user.entity';
import { QuestionEntity } from '../src/infrastructure/db/typeorm.entities';
import { AttemptEntity } from '../src/infrastructure/db/attempt.entity';
import { JwtService } from '@nestjs/jwt';

/**
 * Auth E2E Tests
 * 
 * Tests the complete authentication flow including:
 * - GitHub OAuth redirect
 * - OAuth callback with token generation
 * - Protected routes with JWT
 * - Public routes without auth
 * - Logout functionality
 */
describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepo: Repository<UserEntity>;
  let questionsRepo: Repository<QuestionEntity>;
  let jwtService: JwtService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepo = moduleFixture.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    questionsRepo = moduleFixture.get<Repository<QuestionEntity>>(getRepositoryToken(QuestionEntity));
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up users before each test
    await userRepo.clear();
  });

  describe('GET /api/auth/github', () => {
    it('should redirect to GitHub OAuth URL', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/github')
        .expect(302);

      const location = response.headers.location;
      expect(location).toContain('github.com/login/oauth/authorize');
      expect(location).toContain('client_id=');
      expect(location).toContain('redirect_uri=');
      expect(location).toContain('scope=');
    });

    it('should include correct OAuth parameters', async () => {
      process.env.GITHUB_CLIENT_ID = 'test-client-id';
      process.env.GITHUB_CALLBACK_URL = 'http://localhost:3000/api/auth/github/callback';

      const response = await request(app.getHttpServer())
        .get('/api/auth/github')
        .expect(302);

      const location = response.headers.location;
      expect(location).toContain('client_id=test-client-id');
      expect(location).toContain(encodeURIComponent('http://localhost:3000/api/auth/github/callback'));
      expect(location).toContain('read:user');
      expect(location).toContain('user:email');
    });
  });

  describe('GET /api/auth/github/callback', () => {
    it('should redirect to frontend with token on successful auth', async () => {
      process.env.FRONTEND_URL = 'http://localhost:4200';

      const response = await request(app.getHttpServer())
        .get('/api/auth/github/callback?code=mock_code_valid')
        .expect(302);

      const location = response.headers.location;
      expect(location).toContain('http://localhost:4200/auth/callback');
      expect(location).toContain('token=');
      expect(location).toContain('username=');
    });

    it('should redirect to login with error when user denies access', async () => {
      process.env.FRONTEND_URL = 'http://localhost:4200';

      const response = await request(app.getHttpServer())
        .get('/api/auth/github/callback?error=access_denied')
        .expect(302);

      expect(response.headers.location).toBe('http://localhost:4200/login?error=access_denied');
    });

    it('should redirect to login with error on auth failure', async () => {
      process.env.FRONTEND_URL = 'http://localhost:4200';

      // Force an error by providing an invalid code that won't match our mock
      const response = await request(app.getHttpServer())
        .get('/api/auth/github/callback?code=invalid_code')
        .expect(302);

      expect(response.headers.location).toBe('http://localhost:4200/login?error=auth_failed');
    });

    it('should create a new user on first login', async () => {
      const usersBefore = await userRepo.find();
      expect(usersBefore).toHaveLength(0);

      await request(app.getHttpServer())
        .get('/api/auth/github/callback?code=mock_code_valid')
        .expect(302);

      const usersAfter = await userRepo.find();
      expect(usersAfter).toHaveLength(1);
      expect(usersAfter[0].githubId).toBe('12345678');
      expect(usersAfter[0].username).toBe('testuser');
      expect(usersAfter[0].email).toBe('test@example.com');
    });

    it('should update existing user on subsequent login', async () => {
      // Create initial user
      const user = new UserEntity();
      user.githubId = '12345678';
      user.username = 'oldusername';
      user.email = 'old@example.com';
      await userRepo.save(user);

      await request(app.getHttpServer())
        .get('/api/auth/github/callback?code=mock_code_valid')
        .expect(302);

      const usersAfter = await userRepo.find();
      expect(usersAfter).toHaveLength(1);
      expect(usersAfter[0].username).toBe('testuser');
      expect(usersAfter[0].email).toBe('test@example.com');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      // Create a test user
      const user = new UserEntity();
      user.githubId = '12345678';
      user.username = 'testuser';
      user.email = 'test@example.com';
      user.avatarUrl = 'https://avatars.githubusercontent.com/u/12345678';
      const savedUser = await userRepo.save(user);

      // Generate a valid token
      const token = jwtService.sign({
        sub: savedUser.id,
        githubId: savedUser.githubId,
        username: savedUser.username,
      });

      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        id: savedUser.id,
        username: 'testuser',
        email: 'test@example.com',
        avatarUrl: 'https://avatars.githubusercontent.com/u/12345678',
      });
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });

    it('should return 401 with expired token', async () => {
      const token = jwtService.sign(
        { sub: 'invalid-id', githubId: '123', username: 'test' },
        { expiresIn: '-1s' }
      );

      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('should return 401 when user no longer exists', async () => {
      // Generate token for non-existent user
      const token = jwtService.sign({
        sub: 'non-existent-id',
        githubId: '123',
        username: 'deleteduser',
      });

      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return success with valid token', async () => {
      // Create a test user
      const user = new UserEntity();
      user.githubId = '12345678';
      user.username = 'testuser';
      const savedUser = await userRepo.save(user);

      const token = jwtService.sign({
        sub: savedUser.id,
        githubId: savedUser.githubId,
        username: savedUser.username,
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(response.body).toEqual({
        ok: true,
        message: 'Logged out successfully',
      });
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });

  describe('Public routes without auth', () => {
    it('GET /api/questions should work without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/questions?limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('POST /api/daily-session/start should work without authentication (anonymous)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/daily-session/start')
        .send({ limit: 5 })
        .expect(201);

      expect(response.body).toHaveProperty('mode', 'daily');
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });

  describe('Daily session with auth', () => {
    it('POST /api/daily-session/start should work with authentication', async () => {
      // Create a test user
      const user = new UserEntity();
      user.githubId = '12345678';
      user.username = 'testuser';
      const savedUser = await userRepo.save(user);

      const token = jwtService.sign({
        sub: savedUser.id,
        githubId: savedUser.githubId,
        username: savedUser.username,
      });

      const response = await request(app.getHttpServer())
        .post('/api/daily-session/start')
        .set('Authorization', `Bearer ${token}`)
        .send({ limit: 5 })
        .expect(201);

      expect(response.body).toHaveProperty('mode', 'daily');
      expect(response.body).toHaveProperty('items');
      expect(response.body.items.length).toBeLessThanOrEqual(5);
    });

    it('POST /api/attempts should link to authenticated user when token provided', async () => {
      // Create a test user
      const user = new UserEntity();
      user.githubId = '12345678';
      user.username = 'testuser';
      const savedUser = await userRepo.save(user);

      const token = jwtService.sign({
        sub: savedUser.id,
        githubId: savedUser.githubId,
        username: savedUser.username,
      });

      // Get a valid question ID first
      const questionsRes = await request(app.getHttpServer())
        .get('/api/questions?limit=1')
        .expect(200);

      const questionId = questionsRes.body.items[0].id;

      const response = await request(app.getHttpServer())
        .post('/api/attempts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: savedUser.id, // In real app, this would be extracted from token
          questionId,
          mode: 'daily',
          selectedChoice: 'A',
        })
        .expect(201);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('attemptId');
      expect(response.body).toHaveProperty('isCorrect');
    });
  });

  describe('Token validation edge cases', () => {
    it('should handle malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'NotBearer token')
        .expect(401);
    });

    it('should handle empty Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', '')
        .expect(401);
    });

    it('should handle Authorization header without Bearer prefix', async () => {
      const token = jwtService.sign({
        sub: 'test-id',
        githubId: '123',
        username: 'test',
      });

      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', token)
        .expect(401);
    });

    it('should reject token with invalid signature', async () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
    });
  });
});
