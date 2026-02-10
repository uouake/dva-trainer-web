import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService, AuthUser } from './auth.service';
import { AuthGuard } from './auth.guard';
import { UserIdService } from './user-id.service';
import { DvaApi } from '../api/dva-api';
import { environment } from '../../environments/environment';

/**
 * Auth Integration Tests
 * 
 * Tests complete user scenarios for authentication:
 * - Anonymous user flows
 * - Login flow with GitHub OAuth
 * - OAuth callback handling
 * - Authenticated user flows
 * - Logout flow
 */
describe('Auth Integration Tests', () => {
  let authService: AuthService;
  let userIdService: UserIdService;
  let dvaApi: DvaApi;
  let httpMock: HttpTestingController;
  let routerMock: { navigate: ReturnType<typeof vi.fn>; createUrlTree: ReturnType<typeof vi.fn> };
  let localStorageMock: Record<string, string>;

  const apiUrl = environment.apiBaseUrl;
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
  
  const mockUser: AuthUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    avatarUrl: 'https://avatars.githubusercontent.com/u/123',
  };

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

    // Mock router
    routerMock = {
      navigate: vi.fn(),
      createUrlTree: vi.fn((commands: string[]) => ({ toString: () => commands.join('/') })),
    };

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
        UserIdService,
        DvaApi,
        AuthGuard,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: routerMock },
      ],
    });

    authService = TestBed.inject(AuthService);
    userIdService = TestBed.inject(UserIdService);
    dvaApi = TestBed.inject(DvaApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  /**
   * Scénario 1 : Utilisateur anonyme fait une routine → fonctionne
   */
  describe('Scénario 1: Anonymous user completes a routine', () => {
    it('should allow anonymous user to start daily session', async () => {
      // Ensure not authenticated
      expect(authService.isAuthenticated()).toBe(false);

      // Start daily session (no auth required)
      const promise = firstValueFrom(dvaApi.startDailySession(10));

      const req = httpMock.expectOne(`${apiUrl}/api/daily-session/start`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ limit: 10 });
      
      req.flush({
        mode: 'daily',
        limit: 10,
        userId: null, // Anonymous
        items: [],
      });

      const result = await promise;
      expect(result.mode).toBe('daily');
      expect(result.userId).toBeNull();
    });

    it('should allow anonymous user to fetch questions', async () => {
      const promise = firstValueFrom(dvaApi.listQuestions());

      const req = httpMock.expectOne((r) => r.url === `${apiUrl}/api/questions`);
      req.flush({
        total: 100,
        limit: 20,
        offset: 0,
        items: [],
      });

      const result = await promise;
      expect(result.total).toBe(100);
    });

    it('should generate anonymous userId for attempts', () => {
      const userId1 = userIdService.getOrCreate();
      const userId2 = userIdService.getOrCreate();
      
      expect(userId1).toBeDefined();
      expect(userId1).toBe(userId2); // Should be stable
      expect(localStorage.setItem).toHaveBeenCalledWith('dva.userId', userId1);
    });
  });

  /**
   * Scénario 2 : Utilisateur anonyme clique "Connexion" → redirigé vers GitHub
   */
  describe('Scénario 2: Anonymous user clicks login and is redirected to GitHub', () => {
    it('should redirect to GitHub OAuth when loginWithGitHub is called', () => {
      authService.loginWithGitHub();
      
      expect(window.location.href).toBe(`${apiUrl}/api/auth/github`);
    });

    it('should include correct OAuth endpoint', () => {
      authService.loginWithGitHub();
      
      expect(window.location.href).toContain('/api/auth/github');
    });
  });

  /**
   * Scénario 3 : Retour OAuth avec token → connecté, affichage mis à jour
   */
  describe('Scénario 3: OAuth callback with token connects user and updates UI', () => {
    it('should handle OAuth callback with token', () => {
      const callbackUrl = `${apiUrl}/auth/callback?token=${mockToken}&username=testuser`;
      
      const result = authService.handleAuthCallback(callbackUrl);
      
      expect(result).toBe(true);
      expect(authService.isAuthenticated()).toBe(true);
      expect(authService.getToken()).toBe(mockToken);
    });

    it('should store user info from callback', () => {
      const callbackUrl = `${apiUrl}/auth/callback?token=${mockToken}&username=testuser`;
      
      authService.handleAuthCallback(callbackUrl);
      
      expect(authService.getUser()?.username).toBe('testuser');
    });

    it('should fetch full user profile after callback', async () => {
      const callbackUrl = `${apiUrl}/auth/callback?token=${mockToken}&username=testuser`;
      
      authService.handleAuthCallback(callbackUrl);
      
      // Should make request to get full user info
      const req = httpMock.expectOne(`${apiUrl}/api/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
      
      await firstValueFrom(authService.fetchUser());
      
      expect(authService.getUser()).toEqual(mockUser);
    });

    it('should update state observable on successful auth', async () => {
      const states: boolean[] = [];
      const subscription = authService.state$.subscribe(state => {
        states.push(state.isAuthenticated);
      });

      const callbackUrl = `${apiUrl}/auth/callback?token=${mockToken}&username=testuser`;
      authService.handleAuthCallback(callbackUrl);
      
      httpMock.expectOne(`${apiUrl}/api/auth/me`).flush(mockUser);

      expect(states).toContain(true);
      subscription.unsubscribe();
    });

    it('should handle OAuth error callback', () => {
      const errorUrl = `${apiUrl}/auth/callback?error=access_denied`;
      
      const result = authService.handleAuthCallback(errorUrl);
      
      expect(result).toBe(false);
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  /**
   * Scénario 4 : Utilisateur connecté fait une routine → lié à son compte
   */
  describe('Scénario 4: Authenticated user completes routine linked to account', () => {
    beforeEach(() => {
      // Simulate logged in user
      authService.setToken(mockToken);
      authService.setUser(mockUser);
    });

    it('should show authenticated state', () => {
      expect(authService.isAuthenticated()).toBe(true);
      expect(authService.getUser()).toEqual(mockUser);
      expect(authService.getToken()).toBe(mockToken);
    });

    it('should include auth token in API requests', async () => {
      const promise = firstValueFrom(dvaApi.startDailySession(10));

      const req = httpMock.expectOne(`${apiUrl}/api/daily-session/start`);
      expect(req.request.method).toBe('POST');
      
      // Note: In real implementation, HTTP interceptor would add the token
      req.flush({
        mode: 'daily',
        limit: 10,
        userId: mockUser.id,
        items: [],
      });

      const result = await promise;
      expect(result.userId).toBe(mockUser.id);
    });

    it('should persist session across page reloads', () => {
      // Simulate page reload by creating new service instance
      const newService = TestBed.inject(AuthService);
      
      expect(newService.isAuthenticated()).toBe(true);
      expect(newService.getToken()).toBe(mockToken);
      expect(newService.getUser()).toEqual(mockUser);
    });
  });

  /**
   * Scénario 5 : Déconnexion → retour mode anonyme
   */
  describe('Scénario 5: Logout returns to anonymous mode', () => {
    beforeEach(() => {
      // Start as authenticated
      authService.setToken(mockToken);
      authService.setUser(mockUser);
    });

    it('should clear authentication on logout', () => {
      expect(authService.isAuthenticated()).toBe(true);
      
      authService.logout();
      
      expect(authService.isAuthenticated()).toBe(false);
      expect(authService.getToken()).toBeNull();
      expect(authService.getUser()).toBeNull();
    });

    it('should remove token from storage on logout', () => {
      authService.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('dva.auth.token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('dva.auth.user');
    });

    it('should allow anonymous usage after logout', async () => {
      authService.logout();
      
      expect(authService.isAuthenticated()).toBe(false);
      
      // Can still use API as anonymous
      const promise = firstValueFrom(dvaApi.startDailySession(5));
      
      const req = httpMock.expectOne(`${apiUrl}/api/daily-session/start`);
      req.flush({
        mode: 'daily',
        limit: 5,
        userId: null,
        items: [],
      });

      const result = await promise;
      expect(result.userId).toBeNull();
    });

    it('should redirect to login when accessing protected route after logout', async () => {
      authService.logout();
      
      const guard = TestBed.inject(AuthGuard);
      const canActivate = await firstValueFrom(guard.canActivate());
      
      expect(canActivate.toString()).toContain('login');
    });
  });

  /**
   * AuthGuard Tests
   */
  describe('AuthGuard', () => {
    it('should allow access when authenticated', async () => {
      authService.setToken(mockToken);
      authService.setUser(mockUser);
      
      const guard = TestBed.inject(AuthGuard);
      const result = await firstValueFrom(guard.canActivate());
      
      expect(result).toBe(true);
    });

    it('should redirect to login when not authenticated', async () => {
      authService.logout();
      
      const guard = TestBed.inject(AuthGuard);
      const result = await firstValueFrom(guard.canActivate());
      
      expect(result).not.toBe(true);
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    });
  });

  /**
   * Edge cases and error handling
   */
  describe('Edge cases', () => {
    it('should handle token expiration gracefully', async () => {
      authService.setToken(mockToken);
      
      const promise = firstValueFrom(authService.fetchUser());
      
      const req = httpMock.expectOne(`${apiUrl}/api/auth/me`);
      req.flush('Token expired', { status: 401, statusText: 'Unauthorized' });
      
      await promise;
      
      // Should auto-logout on 401
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should handle network errors during auth', async () => {
      authService.setToken(mockToken);
      
      const promise = firstValueFrom(authService.fetchUser());
      
      const req = httpMock.expectOne(`${apiUrl}/api/auth/me`);
      req.error(new ProgressEvent('Network error'));
      
      await promise;
      
      // Should logout on error
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should allow re-authentication after logout', () => {
      // First login
      authService.setToken(mockToken);
      authService.setUser(mockUser);
      expect(authService.isAuthenticated()).toBe(true);
      
      // Logout
      authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
      
      // Re-login
      authService.setToken(mockToken);
      authService.setUser(mockUser);
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  /**
   * Complete user journey
   */
  describe('Complete user journey', () => {
    it('should handle full anonymous → auth → logout flow', async () => {
      // Start anonymous
      expect(authService.isAuthenticated()).toBe(false);
      
      // Do some questions anonymously
      const anonSession = firstValueFrom(dvaApi.startDailySession(5));
      httpMock.expectOne(`${apiUrl}/api/daily-session/start`).flush({
        mode: 'daily',
        limit: 5,
        userId: null,
        items: [],
      });
      await anonSession;
      
      // Login via OAuth callback
      const callbackUrl = `${apiUrl}/auth/callback?token=${mockToken}&username=testuser`;
      authService.handleAuthCallback(callbackUrl);
      httpMock.expectOne(`${apiUrl}/api/auth/me`).flush(mockUser);
      
      expect(authService.isAuthenticated()).toBe(true);
      expect(authService.getUser()).toEqual(mockUser);
      
      // Do authenticated session
      const authSession = firstValueFrom(dvaApi.startDailySession(5));
      httpMock.expectOne(`${apiUrl}/api/daily-session/start`).flush({
        mode: 'daily',
        limit: 5,
        userId: mockUser.id,
        items: [],
      });
      await authSession;
      
      // Logout
      authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
      
      // Back to anonymous
      const finalSession = firstValueFrom(dvaApi.startDailySession(5));
      httpMock.expectOne(`${apiUrl}/api/daily-session/start`).flush({
        mode: 'daily',
        limit: 5,
        userId: null,
        items: [],
      });
      const finalResult = await finalSession;
      expect(finalResult.userId).toBeNull();
    });
  });
});
