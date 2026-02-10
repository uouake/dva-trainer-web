import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService, AuthUser } from './auth.service';
import { environment } from '../../environments/environment';

/**
 * AuthService Tests
 * 
 * Tests authentication functionality:
 * - Token storage and retrieval
 * - User state management
 * - GitHub OAuth integration
 * - Login/logout flows
 */
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let localStorageMock: Record<string, string>;
  const apiUrl = environment.apiBaseUrl;

  const mockUser: AuthUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    avatarUrl: 'https://avatars.githubusercontent.com/u/123',
  };

  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

  beforeEach(() => {
    // Setup localStorage mock
    localStorageMock = {};
    
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: vi.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    // Mock window.location
    const locationMock = { href: '' };
    Object.defineProperty(global, 'window', {
      value: {
        location: locationMock,
      },
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('Service creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with unauthenticated state', () => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getUser()).toBeNull();
      expect(service.getToken()).toBeNull();
    });
  });

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      service.setToken(mockToken);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('dva.auth.token', mockToken);
    });

    it('should update state to authenticated', () => {
      service.setToken(mockToken);
      
      expect(service.isAuthenticated()).toBe(true);
      expect(service.getToken()).toBe(mockToken);
    });

    it('should emit state change', async () => {
      const states: boolean[] = [];
      const subscription = service.state$.subscribe(state => {
        states.push(state.isAuthenticated);
      });

      service.setToken(mockToken);
      
      expect(states).toContain(true);
      subscription.unsubscribe();
    });
  });

  describe('getToken', () => {
    it('should retrieve token from state', () => {
      service.setToken(mockToken);
      
      expect(service.getToken()).toBe(mockToken);
    });

    it('should return null when not authenticated', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should store user in localStorage as JSON', () => {
      service.setUser(mockUser);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dva.auth.user',
        JSON.stringify(mockUser)
      );
    });

    it('should update state with user', () => {
      service.setUser(mockUser);
      
      expect(service.getUser()).toEqual(mockUser);
    });

    it('should emit state change with user', async () => {
      let receivedUser: AuthUser | null = null;
      const subscription = service.state$.subscribe(state => {
        receivedUser = state.user;
      });

      service.setUser(mockUser);
      
      expect(receivedUser).toEqual(mockUser);
      subscription.unsubscribe();
    });
  });

  describe('removeToken', () => {
    it('should remove token from localStorage', () => {
      service.setToken(mockToken);
      service.removeToken();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('dva.auth.token');
    });
  });

  describe('removeUser', () => {
    it('should remove user from localStorage', () => {
      service.setUser(mockUser);
      service.removeUser();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('dva.auth.user');
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      service.setToken(mockToken);
      service.setUser(mockUser);
    });

    it('should remove token from storage', () => {
      service.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('dva.auth.token');
    });

    it('should remove user from storage', () => {
      service.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('dva.auth.user');
    });

    it('should update state to unauthenticated', () => {
      service.logout();
      
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getUser()).toBeNull();
      expect(service.getToken()).toBeNull();
    });

    it('should emit state change', async () => {
      const states: boolean[] = [];
      const subscription = service.state$.subscribe(state => {
        states.push(state.isAuthenticated);
      });

      service.logout();
      
      // Should have both true (initial) and false (after logout)
      expect(states).toContain(false);
      subscription.unsubscribe();
    });
  });

  describe('loginWithGitHub', () => {
    it('should redirect to GitHub OAuth URL', () => {
      service.loginWithGitHub();
      
      expect(window.location.href).toBe(`${apiUrl}/api/auth/github`);
    });

    it('should include correct API path', () => {
      service.loginWithGitHub();
      
      expect(window.location.href).toContain('/api/auth/github');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when token is set', () => {
      service.setToken(mockToken);
      
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false after logout', () => {
      service.setToken(mockToken);
      service.logout();
      
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('fetchUser', () => {
    it('should fetch user from API with token', async () => {
      service.setToken(mockToken);
      
      const promise = firstValueFrom(service.fetchUser());
      
      const req = httpMock.expectOne(`${apiUrl}/api/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
      
      const result = await promise;
      expect(result).toEqual(mockUser);
    });

    it('should update state with fetched user', async () => {
      service.setToken(mockToken);
      
      const promise = firstValueFrom(service.fetchUser());
      
      const req = httpMock.expectOne(`${apiUrl}/api/auth/me`);
      req.flush(mockUser);
      
      await promise;
      
      expect(service.getUser()).toEqual(mockUser);
    });

    it('should return null when no token', async () => {
      const result = await firstValueFrom(service.fetchUser());
      
      expect(result).toBeNull();
      httpMock.expectNone(`${apiUrl}/api/auth/me`);
    });

    it('should logout on API error', async () => {
      service.setToken(mockToken);
      service.setUser(mockUser);
      
      const promise = firstValueFrom(service.fetchUser());
      
      const req = httpMock.expectOne(`${apiUrl}/api/auth/me`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      
      await promise;
      
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getUser()).toBeNull();
    });
  });

  describe('handleAuthCallback', () => {
    it('should extract and store token from URL', () => {
      const url = `${apiUrl}/auth/callback?token=${mockToken}&username=testuser`;
      
      const result = service.handleAuthCallback(url);
      
      expect(result).toBe(true);
      expect(service.getToken()).toBe(mockToken);
    });

    it('should extract and store username from URL', () => {
      const url = `${apiUrl}/auth/callback?token=${mockToken}&username=testuser`;
      
      service.handleAuthCallback(url);
      
      expect(service.getUser()?.username).toBe('testuser');
    });

    it('should decode URL-encoded username', () => {
      const url = `${apiUrl}/auth/callback?token=${mockToken}&username=test%20user`;
      
      service.handleAuthCallback(url);
      
      expect(service.getUser()?.username).toBe('test user');
    });

    it('should return false when no token in URL', () => {
      const url = `${apiUrl}/auth/callback?error=access_denied`;
      
      const result = service.handleAuthCallback(url);
      
      expect(result).toBe(false);
    });

    it('should handle URL without query params', () => {
      const url = `${apiUrl}/auth/callback`;
      
      const result = service.handleAuthCallback(url);
      
      expect(result).toBe(false);
    });

    it('should fetch user info after setting token', () => {
      const url = `${apiUrl}/auth/callback?token=${mockToken}&username=testuser`;
      
      service.handleAuthCallback(url);
      
      // Should have made a request to fetch user
      httpMock.expectOne(`${apiUrl}/api/auth/me`);
    });
  });

  describe('State persistence', () => {
    it('should load token from localStorage on init', () => {
      localStorageMock['dva.auth.token'] = mockToken;
      
      // Create new service instance
      const newService = TestBed.inject(AuthService);
      
      expect(newService.getToken()).toBe(mockToken);
      expect(newService.isAuthenticated()).toBe(true);
    });

    it('should load user from localStorage on init', () => {
      localStorageMock['dva.auth.token'] = mockToken;
      localStorageMock['dva.auth.user'] = JSON.stringify(mockUser);
      
      const newService = TestBed.inject(AuthService);
      
      expect(newService.getUser()).toEqual(mockUser);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock['dva.auth.token'] = mockToken;
      localStorageMock['dva.auth.user'] = 'invalid-json';
      
      const newService = TestBed.inject(AuthService);
      
      expect(newService.isAuthenticated()).toBe(true);
      expect(newService.getUser()).toBeNull();
    });
  });

  describe('SSR compatibility', () => {
    it('should handle server-side rendering (non-browser)', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      const ssrService = TestBed.inject(AuthService);
      
      // Should not throw when localStorage is not available
      expect(() => {
        ssrService.setToken(mockToken);
        ssrService.setUser(mockUser);
        ssrService.logout();
      }).not.toThrow();
      
      expect(ssrService.isAuthenticated()).toBe(true);
    });
  });
});
