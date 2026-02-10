import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../infrastructure/db/user.entity';

// GitHub user profile returned by OAuth
export interface GitHubProfile {
  id: string;
  username: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

// Utilisateur retourné par le service (sans données sensibles)
export interface AuthUser {
  id: string;
  githubId: string;
  email?: string;
  username?: string;
  name?: string;
  avatarUrl?: string;
}

// JWT payload structure
export interface JwtPayload {
  sub: string; // user id
  githubId: string;
  username?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {
    // Ensure users table exists on startup
    this.ensureUsersTable();
  }

  // Create users table if it doesn't exist
  private async ensureUsersTable(): Promise<void> {
    try {
      // Check if table exists first
      const tableExists = await this.userRepo.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
      
      if (!tableExists[0]?.exists) {
        await this.userRepo.query(`
          CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            github_id TEXT UNIQUE NOT NULL,
            username TEXT,
            name TEXT,
            email TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✓ Users table created');
      } else {
        console.log('✓ Users table already exists');
      }
    } catch (err) {
      console.error('Failed to create users table:', err);
    }
  }

  // Generate GitHub OAuth URL
  getGitHubAuthUrl(): string {
    const clientId = process.env.GITHUB_CLIENT_ID || 'test-client-id';
    const redirectUri = encodeURIComponent(
      process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
    );
    const scope = 'read:user user:email';
    
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  }

  // Exchange code for access token (mockable for tests)
  async exchangeCodeForToken(code: string): Promise<string> {
    // In production, this would call GitHub's token endpoint
    // For testing, we allow injection of a mock
    if (process.env.NODE_ENV === 'test' && code.startsWith('mock_code_')) {
      return 'mock_access_token';
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('GitHub OAuth not configured');
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new UnauthorizedException(`GitHub OAuth error: ${data.error}`);
    }

    return data.access_token;
  }

  // Fetch user profile from GitHub API (mockable for tests)
  async fetchGitHubProfile(accessToken: string): Promise<GitHubProfile> {
    // Mock for testing
    if (process.env.NODE_ENV === 'test' && accessToken === 'mock_access_token') {
      return {
        id: '12345678',
        username: 'testuser',
        email: 'test@example.com',
        avatarUrl: 'https://avatars.githubusercontent.com/u/12345678',
      };
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch GitHub profile');
    }

    const data = await response.json();
    
    return {
      id: String(data.id),
      username: data.login,
      name: data.name || data.login, // Récupère le vrai nom, fallback sur login
      email: data.email,
      avatarUrl: data.avatar_url,
    };
  }

  // Find or create user from GitHub profile
  async findOrCreateUser(profile: GitHubProfile): Promise<UserEntity> {
    let user = await this.userRepo.findOne({
      where: { githubId: profile.id },
    });

    if (!user) {
      user = new UserEntity();
      user.githubId = profile.id;
      user.username = profile.username;
      user.name = profile.name || profile.username; // Utilise le vrai nom
      user.email = profile.email;
      user.avatarUrl = profile.avatarUrl;
      user = await this.userRepo.save(user);
    } else {
      // Update profile info if changed
      if (profile.username) user.username = profile.username;
      if (profile.name) user.name = profile.name;
      if (profile.email) user.email = profile.email;
      if (profile.avatarUrl) user.avatarUrl = profile.avatarUrl;
      user = await this.userRepo.save(user);
    }

    return user;
  }

  // Convert UserEntity to AuthUser
  toAuthUser(user: UserEntity): AuthUser {
    return {
      id: user.id,
      githubId: user.githubId,
      email: user.email,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
  }

  // Generate JWT token for user
  generateToken(user: UserEntity): string {
    const payload: JwtPayload = {
      sub: user.id,
      githubId: user.githubId,
      username: user.username,
    };

    return this.jwtService.sign(payload);
  }

  // Login - génère un token et retourne les infos utilisateur
  async login(user: UserEntity): Promise<{ accessToken: string; user: AuthUser }> {
    const accessToken = this.generateToken(user);
    return { accessToken, user: this.toAuthUser(user) };
  }

  // Find user by ID
  async findById(id: string): Promise<AuthUser | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    return user ? this.toAuthUser(user) : null;
  }

  // Validate JWT payload and return user
  async validateUser(payload: JwtPayload): Promise<AuthUser | null> {
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    return user ? this.toAuthUser(user) : null;
  }

  // Handle OAuth callback
  async handleGitHubCallback(code: string): Promise<{ token: string; user: AuthUser }> {
    const accessToken = await this.exchangeCodeForToken(code);
    const profile = await this.fetchGitHubProfile(accessToken);
    const user = await this.findOrCreateUser(profile);
    const token = this.generateToken(user);

    return { token, user: this.toAuthUser(user) };
  }
}
