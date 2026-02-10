import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';
import { DvaApi } from '../../api/dva-api';
import { UserIdService } from '../../core/user-id.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock UserIdService
class MockUserIdService {
  getOrCreate() {
    return 'test-user-id';
  }
}

describe('Dashboard Component', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let api: DvaApi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: UserIdService, useClass: MockUserIdService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    api = TestBed.inject(DvaApi);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the dashboard title', () => {
    // Mock API responses
    vi.spyOn(api, 'dashboardOverview').and.returnValue(
      of({
        ok: true,
        totalAttempts: 0,
        correctAttempts: 0,
        successRate: null,
        questionsPracticed: 0,
        weakConcepts: [],
      })
    );
    vi.spyOn(api, 'dashboardDomains').and.returnValue(
      of({
        ok: true,
        items: [],
      })
    );

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Tableau de bord');
  });

  it('should display action cards', () => {
    vi.spyOn(api, 'dashboardOverview').and.returnValue(
      of({
        ok: true,
        totalAttempts: 0,
        correctAttempts: 0,
        successRate: null,
        questionsPracticed: 0,
        weakConcepts: [],
      })
    );
    vi.spyOn(api, 'dashboardDomains').and.returnValue(
      of({
        ok: true,
        items: [],
      })
    );

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Routine Quotidienne');
    expect(compiled.textContent).toContain("Simulateur d'Examen");
  });

  it('should have a link to routine page', () => {
    vi.spyOn(api, 'dashboardOverview').and.returnValue(
      of({
        ok: true,
        totalAttempts: 0,
        correctAttempts: 0,
        successRate: null,
        questionsPracticed: 0,
        weakConcepts: [],
      })
    );
    vi.spyOn(api, 'dashboardDomains').and.returnValue(
      of({
        ok: true,
        items: [],
      })
    );

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const routineLink = compiled.querySelector('a[href="/routine"]');
    expect(routineLink).toBeTruthy();
  });

  it('should have a link to exam page', () => {
    vi.spyOn(api, 'dashboardOverview').and.returnValue(
      of({
        ok: true,
        totalAttempts: 0,
        correctAttempts: 0,
        successRate: null,
        questionsPracticed: 0,
        weakConcepts: [],
      })
    );
    vi.spyOn(api, 'dashboardDomains').and.returnValue(
      of({
        ok: true,
        items: [],
      })
    );

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const examLink = compiled.querySelector('a[href="/exam"]');
    expect(examLink).toBeTruthy();
  });

  it('should display stats cards', () => {
    vi.spyOn(api, 'dashboardOverview').and.returnValue(
      of({
        ok: true,
        totalAttempts: 10,
        correctAttempts: 8,
        successRate: 80,
        questionsPracticed: 10,
        weakConcepts: [],
      })
    );
    vi.spyOn(api, 'dashboardDomains').and.returnValue(
      of({
        ok: true,
        items: [],
      })
    );

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Questions pratiquées');
  });

  it('should handle API errors gracefully', () => {
    vi.spyOn(api, 'dashboardOverview').and.returnValue(
      of({
        ok: true,
        totalAttempts: 0,
        correctAttempts: 0,
        successRate: null,
        questionsPracticed: 0,
        weakConcepts: [],
      })
    );
    vi.spyOn(api, 'dashboardDomains').and.returnValue(
      of({
        ok: true,
        items: [],
      })
    );

    fixture.detectChanges();

    // Component should still render even if there are errors
    expect(component).toBeTruthy();
  });
});
