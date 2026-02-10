import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// User type returned by /api/auth/me
export interface AuthUser {
  id: string;
  username: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
}

const TOKEN_KEY = 'dva.auth.token';
const USER_KEY = 'dva.auth.user';

/**
 * AuthService
 * 
 * Manages authentication state using JWT tokens stored in localStorage.
 * Supports GitHub OAuth flow.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiBaseUrl;
  private readonly isBrowser: boolean;
  
  private stateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  public state$ = this.stateSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadStateFromStorage();
  }

  /**
   * Get current state value
   */
  get state(): AuthState {
    return this.stateSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated && !!this.state.token;
  }

  /**
   * Get current user
   */
  getUser(): AuthUser | null {
    return this.state.user;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return this.state.token;
  }

  /**
   * Store token and update state
   */
  setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    this.stateSubject.next({
      ...this.stateSubject.value,
      isAuthenticated: true,
      token,
    });
  }

  /**
   * Store user info and update state
   */
  setUser(user: AuthUser): void {
    if (this.isBrowser) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    this.stateSubject.next({
      ...this.stateSubject.value,
      user,
    });
  }

  /**
   * Remove token from storage
   */
  removeToken(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  /**
   * Remove user from storage
   */
  removeUser(): void {
    if (this.isBrowser) {
      localStorage.removeItem(USER_KEY);
    }
  }

  /**
   * Redirect to GitHub OAuth login
   */
  loginWithGitHub(): void {
    if (this.isBrowser) {
      window.location.href = `${this.apiUrl}/api/auth/github`;
    }
  }

  /**
   * Logout user and clear storage
   */
  logout(): void {
    this.removeToken();
    this.removeUser();
    this.stateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  }

  /**
   * Fetch current user info from API
   */
  fetchUser(): Observable<AuthUser | null> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }

    return this.http.get<AuthUser>(`${this.apiUrl}/api/auth/me`).pipe(
      tap((user) => {
        this.setUser(user);
      }),
      catchError(() => {
        // Token invalid or expired
        this.logout();
        return of(null);
      }),
    );
  }

  /**
   * Handle OAuth callback - extract and store token from URL
   */
  handleAuthCallback(url: string): boolean {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    const username = urlObj.searchParams.get('username');

    if (token) {
      this.setToken(token);
      if (username) {
        this.setUser({
          id: '', // Will be fetched from API
          username: decodeURIComponent(username),
        });
      }
      // Fetch full user info
      this.fetchUser().subscribe();
      return true;
    }

    return false;
  }

  /**
   * Load authentication state from localStorage
   */
  private loadStateFromStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    
    let user: AuthUser | null = null;
    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch {
        // Invalid JSON, clear it
        localStorage.removeItem(USER_KEY);
      }
    }

    if (token) {
      this.stateSubject.next({
        isAuthenticated: true,
        token,
        user,
      });
      
      // Validate token by fetching user
      this.fetchUser().subscribe();
    }
  }
}
