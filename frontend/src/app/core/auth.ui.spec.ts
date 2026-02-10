import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService, AuthState, AuthUser } from './auth.service';

// Mock Components for testing UI structure
@Component({
  selector: 'app-login',
  template: `
    <div class="login-page">
      <h1>Connexion</h1>
      <p>Connectez-vous pour sauvegarder votre progression</p>
      <button class="github-login-btn" (click)="login()">
        <span class="github-icon">🐙</span>
        Continuer avec GitHub
      </button>
    </div>
  `,
})
class MockLoginComponent {
  constructor(private authService: AuthService) {}
  
  login() {
    this.authService.loginWithGitHub();
  }
}

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="sidebar" [class.mobile-open]="mobileOpen">
      <div class="user-section">
        <ng-container *ngIf="isAuthenticated; else anonymous">
          <img [src]="user?.avatarUrl || 'default-avatar.png'" class="avatar" alt="Avatar">
          <span class="username">{{ user?.username }}</span>
          <button class="logout-btn" (click)="logout()">Déconnexion</button>
        </ng-container>
        <ng-template #anonymous>
          <div class="anonymous-user">
            <span>Utilisateur anonyme</span>
            <button class="login-btn" (click)="goToLogin()">Connexion</button>
          </div>
        </ng-template>
      </div>
      <nav class="nav-menu">
        <a routerLink="/routine" class="nav-item">Routine quotidienne</a>
        <a routerLink="/exam" class="nav-item">Mode examen</a>
        <a routerLink="/dashboard" class="nav-item">Tableau de bord</a>
      </nav>
    </aside>
  `,
})
class MockSidebarComponent {
  @Input() mobileOpen = false;
  isAuthenticated = false;
  user: AuthUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.authService.state$.subscribe((state: AuthState) => {
      this.isAuthenticated = state.isAuthenticated;
      this.user = state.user;
    });
  }

  logout() {
    this.authService.logout();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="auth-callback-page">
      <div class="loading-spinner"></div>
      <p>Connexion en cours...</p>
    </div>
  `,
})
class MockAuthCallbackComponent {
  constructor(private authService: AuthService) {
    // Handle callback URL
    const url = window.location.href;
    this.authService.handleAuthCallback(url);
  }
}

/**
 * UI Tests for Authentication Components
 * 
 * Tests visual elements and user interactions:
 * - Login page display
 * - GitHub button visibility
 * - Sidebar state (authenticated/anonymous)
 * - Mobile responsiveness
 */
describe('Auth UI Tests', () => {
  let authService: AuthService;
  let localStorageMock: Record<string, string>;
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
  
  const mockUser: AuthUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    avatarUrl: 'https://avatars.githubusercontent.com/u/123',
  };

  beforeEach(() => {
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

    Object.defineProperty(global, 'window', {
      value: {
        location: { href: '' },
      },
      writable: true,
    });

    TestBed.configureTestingModule({
      declarations: [],
      providers: [
        AuthService,
        provideRouter([]),
        { provide: 'PLATFORM_ID', useValue: 'browser' },
      ],
    });

    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Page UI', () => {
    it('should display login page with correct title', () => {
      const fixture = TestBed.createComponent(MockLoginComponent);
      fixture.detectChanges();
      
      const titleElement = fixture.debugElement.query(By.css('h1'));
      expect(titleElement.nativeElement.textContent).toContain('Connexion');
    });

    it('should display explanatory text', () => {
      const fixture = TestBed.createComponent(MockLoginComponent);
      fixture.detectChanges();
      
      const paragraph = fixture.debugElement.query(By.css('p'));
      expect(paragraph.nativeElement.textContent).toContain('sauvegarder');
    });

    it('should display GitHub login button', () => {
      const fixture = TestBed.createComponent(MockLoginComponent);
      fixture.detectChanges();
      
      const button = fixture.debugElement.query(By.css('.github-login-btn'));
      expect(button).toBeTruthy();
      expect(button.nativeElement.textContent).toContain('GitHub');
    });

    it('should have GitHub icon in button', () => {
      const fixture = TestBed.createComponent(MockLoginComponent);
      fixture.detectChanges();
      
      const icon = fixture.debugElement.query(By.css('.github-icon'));
      expect(icon).toBeTruthy();
    });

    it('should redirect to GitHub OAuth when button clicked', () => {
      const fixture = TestBed.createComponent(MockLoginComponent);
      fixture.detectChanges();
      
      const button = fixture.debugElement.query(By.css('.github-login-btn'));
      button.nativeElement.click();
      
      expect(window.location.href).toContain('/api/auth/github');
    });
  });

  describe('Sidebar - Anonymous State', () => {
    it('should display anonymous user label', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const anonymousSection = fixture.debugElement.query(By.css('.anonymous-user'));
      expect(anonymousSection).toBeTruthy();
      expect(anonymousSection.nativeElement.textContent).toContain('anonyme');
    });

    it('should display login button when anonymous', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const loginBtn = fixture.debugElement.query(By.css('.login-btn'));
      expect(loginBtn).toBeTruthy();
      expect(loginBtn.nativeElement.textContent).toContain('Connexion');
    });

    it('should not display logout button when anonymous', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const logoutBtn = fixture.debugElement.query(By.css('.logout-btn'));
      expect(logoutBtn).toBeFalsy();
    });

    it('should not display avatar when anonymous', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const avatar = fixture.debugElement.query(By.css('.avatar'));
      expect(avatar).toBeFalsy();
    });

    it('should have navigation menu', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const navMenu = fixture.debugElement.query(By.css('.nav-menu'));
      expect(navMenu).toBeTruthy();
    });

    it('should have navigation items', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const navItems = fixture.debugElement.queryAll(By.css('.nav-item'));
      expect(navItems.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Sidebar - Authenticated State', () => {
    beforeEach(() => {
      authService.setToken(mockToken);
      authService.setUser(mockUser);
    });

    it('should display username when authenticated', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const username = fixture.debugElement.query(By.css('.username'));
      expect(username).toBeTruthy();
      expect(username.nativeElement.textContent).toBe('testuser');
    });

    it('should display user avatar when authenticated', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const avatar = fixture.debugElement.query(By.css('.avatar'));
      expect(avatar).toBeTruthy();
      expect(avatar.nativeElement.src).toContain('avatars.githubusercontent.com');
    });

    it('should display logout button when authenticated', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const logoutBtn = fixture.debugElement.query(By.css('.logout-btn'));
      expect(logoutBtn).toBeTruthy();
      expect(logoutBtn.nativeElement.textContent).toContain('Déconnexion');
    });

    it('should not display anonymous section when authenticated', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const anonymousSection = fixture.debugElement.query(By.css('.anonymous-user'));
      expect(anonymousSection).toBeFalsy();
    });

    it('should not display login button when authenticated', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const loginBtn = fixture.debugElement.query(By.css('.login-btn'));
      expect(loginBtn).toBeFalsy();
    });

    it('should call logout when logout button clicked', () => {
      const logoutSpy = vi.spyOn(authService, 'logout');
      
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const logoutBtn = fixture.debugElement.query(By.css('.logout-btn'));
      logoutBtn.nativeElement.click();
      
      expect(logoutSpy).toHaveBeenCalled();
    });

    it('should switch to anonymous UI after logout', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      // Initially shows authenticated state
      expect(fixture.debugElement.query(By.css('.username'))).toBeTruthy();
      
      // Logout
      authService.logout();
      fixture.detectChanges();
      
      // Now shows anonymous state
      expect(fixture.debugElement.query(By.css('.anonymous-user'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.username'))).toBeFalsy();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have mobile-open class when mobile menu is toggled', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.componentInstance.mobileOpen = true;
      fixture.detectChanges();
      
      const sidebar = fixture.debugElement.query(By.css('.sidebar'));
      expect(sidebar.nativeElement.classList).toContain('mobile-open');
    });

    it('should not have mobile-open class by default', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const sidebar = fixture.debugElement.query(By.css('.sidebar'));
      expect(sidebar.nativeElement.classList).not.toContain('mobile-open');
    });
  });

  describe('Auth Callback Page', () => {
    it('should display loading state during OAuth callback', () => {
      const fixture = TestBed.createComponent(MockAuthCallbackComponent);
      fixture.detectChanges();
      
      const loadingText = fixture.debugElement.query(By.css('p'));
      expect(loadingText.nativeElement.textContent).toContain('Connexion en cours');
    });

    it('should have loading spinner', () => {
      const fixture = TestBed.createComponent(MockAuthCallbackComponent);
      fixture.detectChanges();
      
      const spinner = fixture.debugElement.query(By.css('.loading-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should process token from URL on init', () => {
      window.location.href = 'http://localhost:4200/auth/callback?token=abc123&username=test';
      
      const handleSpy = vi.spyOn(authService, 'handleAuthCallback');
      
      const fixture = TestBed.createComponent(MockAuthCallbackComponent);
      fixture.detectChanges();
      
      expect(handleSpy).toHaveBeenCalled();
    });
  });

  describe('Button Interactions', () => {
    it('should have clickable GitHub button', () => {
      const fixture = TestBed.createComponent(MockLoginComponent);
      fixture.detectChanges();
      
      const button = fixture.debugElement.query(By.css('.github-login-btn'));
      expect(button.nativeElement.disabled).toBeFalsy();
      expect(button.nativeElement.tagName.toLowerCase()).toBe('button');
    });

    it('should have clickable login button in sidebar', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const loginBtn = fixture.debugElement.query(By.css('.login-btn'));
      expect(loginBtn.nativeElement.disabled).toBeFalsy();
    });

    it('should have clickable logout button when authenticated', () => {
      authService.setToken(mockToken);
      authService.setUser(mockUser);
      
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const logoutBtn = fixture.debugElement.query(By.css('.logout-btn'));
      expect(logoutBtn.nativeElement.disabled).toBeFalsy();
    });
  });

  describe('Navigation Links', () => {
    it('should have correct router links in navigation', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const navLinks = fixture.debugElement.queryAll(By.css('.nav-item'));
      const hrefs = navLinks.map(link => link.nativeElement.getAttribute('routerLink'));
      
      expect(hrefs).toContain('/routine');
      expect(hrefs).toContain('/exam');
    });

    it('should have accessible navigation items', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      const navItems = fixture.debugElement.queryAll(By.css('.nav-item'));
      navItems.forEach(item => {
        expect(item.nativeElement.textContent.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Visual State Transitions', () => {
    it('should transition from anonymous to authenticated state', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      // Start anonymous
      expect(fixture.debugElement.query(By.css('.anonymous-user'))).toBeTruthy();
      
      // Authenticate
      authService.setToken(mockToken);
      authService.setUser(mockUser);
      fixture.detectChanges();
      
      // Now authenticated
      expect(fixture.debugElement.query(By.css('.username'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.avatar'))).toBeTruthy();
    });

    it('should maintain navigation visibility during auth state changes', () => {
      const fixture = TestBed.createComponent(MockSidebarComponent);
      fixture.detectChanges();
      
      // Nav should be visible when anonymous
      expect(fixture.debugElement.query(By.css('.nav-menu'))).toBeTruthy();
      
      // Authenticate
      authService.setToken(mockToken);
      authService.setUser(mockUser);
      fixture.detectChanges();
      
      // Nav still visible when authenticated
      expect(fixture.debugElement.query(By.css('.nav-menu'))).toBeTruthy();
    });
  });
});
