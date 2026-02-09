import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';
import { DvaApi } from '../../api/dva-api';
import { UserIdService } from '../../core/user-id.service';
import { environment } from '../../../environments/environment';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let httpMock: HttpTestingController;
  let userIdService: UserIdService;
  const baseUrl = environment.apiBaseUrl;
  const mockUserId = 'test-user-123';

  const mockOverviewResponse = {
    ok: true,
    totalAttempts: 50,
    correctAttempts: 40,
    successRate: 80,
    questionsPracticed: 30,
    weakConcepts: [
      { conceptKey: 'lambda-basics', wrongCount: 3 },
    ],
  };

  const mockDomainsResponse = {
    ok: true,
    items: [
      { domainKey: 'development', attempts: 20, correct: 15, successRate: 75 },
      { domainKey: 'security', attempts: 10, correct: 8, successRate: 80 },
    ],
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    
    const mockUserIdService = {
      getOrCreate: vi.fn().mockReturnValue(mockUserId),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: UserIdService, useValue: mockUserIdService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    userIdService = TestBed.inject(UserIdService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', async () => {
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('should get userId from UserIdService', async () => {
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();
    expect(component.userId).toBe(mockUserId);
    expect(userIdService.getOrCreate).toHaveBeenCalled();
  });

  it('should start with loading state', async () => {
    expect(component.loading).toBe(true);
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();
  });

  it('should call load on init', () => {
    const req = httpMock.expectOne((r) => 
      r.url === `${baseUrl}/api/dashboard/overview`
    );
    expect(req.request.method).toBe('GET');
  });

  it('should load dashboard data successfully', async () => {
    const overviewReq = httpMock.expectOne((r) => 
      r.url === `${baseUrl}/api/dashboard/overview` &&
      r.params.get('userId') === mockUserId
    );
    overviewReq.flush(mockOverviewResponse);

    await fixture.whenStable();

    const domainsReq = httpMock.expectOne((r) => 
      r.url === `${baseUrl}/api/dashboard/domains` &&
      r.params.get('userId') === mockUserId
    );
    domainsReq.flush(mockDomainsResponse);

    await fixture.whenStable();

    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
    expect(component.stats[0].value).toBe('30');
    expect(component.stats[1].value).toBe('80%');
  });

  it('should handle null success rate', async () => {
    const overviewWithNullRate = {
      ...mockOverviewResponse,
      successRate: null,
    };

    const overviewReq = httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview'));
    overviewReq.flush(overviewWithNullRate);

    await fixture.whenStable();

    const domainsReq = httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains'));
    domainsReq.flush(mockDomainsResponse);

    await fixture.whenStable();

    expect(component.stats[1].value).toBe('—');
  });

  it('should handle empty weak concepts', async () => {
    const overviewNoWeak = {
      ...mockOverviewResponse,
      weakConcepts: [],
    };

    const overviewReq = httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview'));
    overviewReq.flush(overviewNoWeak);

    await fixture.whenStable();

    const domainsReq = httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains'));
    domainsReq.flush(mockDomainsResponse);

    await fixture.whenStable();

    expect(component.weakConcepts).toEqual([]);
  });

  it('should handle domain mapping correctly', async () => {
    const overviewReq = httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview'));
    overviewReq.flush(mockOverviewResponse);

    await fixture.whenStable();

    const domainsReq = httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains'));
    domainsReq.flush({
      ok: true,
      items: [
        { domainKey: 'development', attempts: 10, correct: 8, successRate: 80 },
        { domainKey: 'security', attempts: 5, correct: 3, successRate: 60 },
        { domainKey: 'deployment', attempts: 3, correct: 2, successRate: 67 },
        { domainKey: 'troubleshooting', attempts: 2, correct: 1, successRate: 50 },
        { domainKey: 'unknown', attempts: 1, correct: 0, successRate: 0 },
      ],
    });

    await fixture.whenStable();

    expect(component.domainItems.length).toBe(5);
    expect(component.domainItems.map((d) => d.label)).toContain('Développement');
  });

  it('should handle error in overview request', async () => {
    const overviewReq = httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview'));
    overviewReq.flush('Server error', { status: 500, statusText: 'Server Error' });

    await fixture.whenStable();

    expect(component.loading).toBe(false);
    expect(component.error).toContain('500');
  });

  it('should continue if domains request fails', async () => {
    const overviewReq = httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview'));
    overviewReq.flush(mockOverviewResponse);

    await fixture.whenStable();

    const domainsReq = httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains'));
    domainsReq.flush('Error', { status: 500, statusText: 'Server Error' });

    await fixture.whenStable();

    expect(component.loading).toBe(false);
    expect(component.domainItems).toEqual([]);
  });

  it('should open reset modal', async () => {
    // Initial load
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();

    expect(component.showResetModal).toBe(false);
    component.openResetModal();
    expect(component.showResetModal).toBe(true);
  });

  it('should close reset modal', async () => {
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();

    component.openResetModal();
    expect(component.showResetModal).toBe(true);
    component.closeResetModal();
    expect(component.showResetModal).toBe(false);
  });

  it('should reset KPIs successfully', async () => {
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();

    component.openResetModal();
    component.confirmResetKpis();

    const resetReq = httpMock.expectOne((r) =>
      r.url.includes('/api/dashboard/reset')
    );
    expect(resetReq.request.method).toBe('POST');
    resetReq.flush({ ok: true, deleted: 50 });

    await fixture.whenStable();

    // Reset triggers a reload
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();

    expect(component.showResetModal).toBe(false);
    // After reset and reload, the stats are restored
    expect(component.weakConcepts).toEqual(mockOverviewResponse.weakConcepts);
    expect(component.domainItems.length).toBe(mockDomainsResponse.items.length);
  });

  it('should handle reset error', async () => {
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();

    component.openResetModal();
    component.confirmResetKpis();

    const resetReq = httpMock.expectOne((r) => r.url.includes('/api/dashboard/reset'));
    resetReq.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    await fixture.whenStable();

    expect(component.showResetModal).toBe(false);
    expect(component.error).toContain('403');
  });

  it('should reload dashboard after reset', async () => {
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();

    component.openResetModal();
    component.confirmResetKpis();

    httpMock.expectOne((r) => r.url.includes('/api/dashboard/reset')).flush({ ok: true, deleted: 50 });
    await fixture.whenStable();

    // Should trigger a reload
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();

    expect(component.loading).toBe(false);
  });

  it('should have correct initial actions', async () => {
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();
    expect(component.actions.length).toBe(2);
    expect(component.actions[0].to).toBe('/routine');
    expect(component.actions[0].title).toBe('Routine Quotidienne');
    expect(component.actions[1].to).toBe('/exam');
    expect(component.actions[1].title).toBe("Simulateur d'Examen");
  });

  it('should have correct initial domains', async () => {
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();
    expect(component.domains.length).toBe(4);
    expect(component.domains.map((d) => d.name)).toEqual([
      'Développement',
      'Sécurité',
      'Déploiement',
      'Monitoring',
    ]);
  });

  it('should have correct preview count', async () => {
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/overview')).flush(mockOverviewResponse);
    await fixture.whenStable();
    httpMock.expectOne((r) => r.url.includes('/api/dashboard/domains')).flush(mockDomainsResponse);
    await fixture.whenStable();
    expect(component.previewCount).toBe(3);
  });
});
