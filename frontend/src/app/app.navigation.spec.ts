import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { Dashboard } from './pages/dashboard/dashboard';
import { Routine } from './pages/routine/routine';
import { Exam } from './pages/exam/exam';
import { describe, it, expect, beforeEach } from 'vitest';
import { routes } from './app.routes';
import { DvaApi } from './api/dva-api';
import { UserIdService } from './core/user-id.service';
import { of } from 'rxjs';
import { vi } from 'vitest';

// Mocks
class MockUserIdService {
  getOrCreate() {
    return 'test-user-id';
  }
}

class MockDvaApi {
  dashboardOverview() {
    return of({
      ok: true,
      totalAttempts: 0,
      correctAttempts: 0,
      successRate: null,
      questionsPracticed: 0,
      weakConcepts: [],
    });
  }
  dashboardDomains() {
    return of({
      ok: true,
      items: [],
    });
  }
  startDailySession() {
    return of({
      mode: 'daily' as const,
      limit: 10,
      items: [],
    });
  }
}

describe('Navigation Tests', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserIdService, useClass: MockUserIdService },
        { provide: DvaApi, useClass: MockDvaApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    router = TestBed.inject(Router);
    
    // Initial navigation
    await router.initialNavigation();
  });

  it('should redirect to dashboard by default', async () => {
    await router.navigate(['']);
    fixture.detectChanges();
    
    expect(router.url).toBe('/dashboard');
  });

  it('should navigate to dashboard', async () => {
    await router.navigate(['/dashboard']);
    fixture.detectChanges();
    
    expect(router.url).toBe('/dashboard');
  });

  it('should navigate to routine', async () => {
    await router.navigate(['/routine']);
    fixture.detectChanges();
    
    expect(router.url).toBe('/routine');
  });

  it('should navigate to exam', async () => {
    await router.navigate(['/exam']);
    fixture.detectChanges();
    
    expect(router.url).toBe('/exam');
  });

  it('should have router outlet', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});

// Test simple des routes
describe('App Routes', () => {
  it('should have dashboard route', () => {
    const dashboardRoute = routes.find((r) => r.path === 'dashboard');
    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute?.component).toBe(Dashboard);
  });

  it('should have routine route', () => {
    const routineRoute = routes.find((r) => r.path === 'routine');
    expect(routineRoute).toBeDefined();
    expect(routineRoute?.component).toBe(Routine);
  });

  it('should have exam route', () => {
    const examRoute = routes.find((r) => r.path === 'exam');
    expect(examRoute).toBeDefined();
    expect(examRoute?.component).toBe(Exam);
  });

  it('should redirect empty path to dashboard', () => {
    const emptyRoute = routes.find((r) => r.path === '' && r.pathMatch === 'full');
    expect(emptyRoute).toBeDefined();
    expect(emptyRoute?.redirectTo).toBe('dashboard');
  });
});
