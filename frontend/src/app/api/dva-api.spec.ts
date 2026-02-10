import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DvaApi, Question, CreateAttemptDto } from './dva-api';
import { environment } from '../../environments/environment';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('DvaApi', () => {
  let service: DvaApi;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiBaseUrl;

  const mockQuestion: Question = {
    id: 'q1',
    exam: 'DVA-C02',
    topic: 1,
    questionNumber: 1,
    stem: 'What is AWS Lambda?',
    choices: {
      A: 'A compute service',
      B: 'A storage service',
      C: 'A database service',
      D: 'A networking service',
    },
    answer: 'A',
    requiredAnswers: 1,
    conceptKey: 'lambda-basics',
    domainKey: 'development',
    frExplanation: 'Lambda est un service de calcul serverless',
    frExplanationPedagogique: undefined,
    sourceUrl: 'https://aws.amazon.com/lambda/',
    textHash: 'abc123',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        DvaApi,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    service = TestBed.inject(DvaApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('health', () => {
    it('should return health status', async () => {
      const mockResponse = { ok: true };
      const promise = firstValueFrom(service.health());

      const req = httpMock.expectOne(`${baseUrl}/api/health`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const res = await promise;
      expect(res).toEqual(mockResponse);
    });

    it('should handle health check failure', async () => {
      const promise = firstValueFrom(service.health());

      const req = httpMock.expectOne(`${baseUrl}/api/health`);
      req.flush('Server error', { status: 500, statusText: 'Server Error' });

      await expect(promise).rejects.toThrow();
    });
  });

  describe('listQuestions', () => {
    it('should return paginated questions with default params', async () => {
      const mockResponse = {
        total: 1,
        limit: 20,
        offset: 0,
        items: [mockQuestion],
      };
      const promise = firstValueFrom(service.listQuestions());

      const req = httpMock.expectOne((req) => 
        req.url === `${baseUrl}/api/questions` &&
        req.params.get('limit') === '20' &&
        req.params.get('offset') === '0'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const res = await promise;
      expect(res).toEqual(mockResponse);
      expect(res.items.length).toBe(1);
    });

    it('should return paginated questions with custom params', async () => {
      const mockResponse = {
        total: 100,
        limit: 10,
        offset: 20,
        items: [mockQuestion],
      };
      const promise = firstValueFrom(service.listQuestions(10, 20));

      const req = httpMock.expectOne((req) => 
        req.url === `${baseUrl}/api/questions` &&
        req.params.get('limit') === '10' &&
        req.params.get('offset') === '20'
      );
      req.flush(mockResponse);

      const res = await promise;
      expect(res.limit).toBe(10);
      expect(res.offset).toBe(20);
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        total: 0,
        limit: 20,
        offset: 0,
        items: [],
      };
      const promise = firstValueFrom(service.listQuestions());

      const req = httpMock.expectOne((req) => 
        req.url === `${baseUrl}/api/questions`
      );
      req.flush(mockResponse);

      const res = await promise;
      expect(res.items).toEqual([]);
      expect(res.total).toBe(0);
    });
  });

  describe('startDailySession', () => {
    it('should start daily session with default count', async () => {
      const mockResponse = {
        mode: 'daily' as const,
        limit: 10,
        items: [mockQuestion, mockQuestion],
      };
      const promise = firstValueFrom(service.startDailySession());

      const req = httpMock.expectOne(`${baseUrl}/api/daily-session/start`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ limit: 10 });
      req.flush(mockResponse);

      const res = await promise;
      expect(res.mode).toBe('daily');
      expect(res.items.length).toBe(2);
    });

    it('should start daily session with custom count', async () => {
      const mockResponse = {
        mode: 'daily' as const,
        limit: 15,
        items: Array(15).fill(mockQuestion),
      };
      const promise = firstValueFrom(service.startDailySession(15));

      const req = httpMock.expectOne(`${baseUrl}/api/daily-session/start`);
      expect(req.request.body).toEqual({ limit: 15 });
      req.flush(mockResponse);

      const res = await promise;
      expect(res.limit).toBe(15);
      expect(res.items.length).toBe(15);
    });

    it('should handle error when starting session fails', async () => {
      const promise = firstValueFrom(service.startDailySession());

      const req = httpMock.expectOne(`${baseUrl}/api/daily-session/start`);
      req.flush('Service unavailable', { status: 503, statusText: 'Service Unavailable' });

      await expect(promise).rejects.toThrow();
    });
  });

  describe('startExam', () => {
    it('should start exam and return questions', async () => {
      const mockResponse = {
        mode: 'exam' as const,
        count: 65,
        durationMinutes: 130,
        items: Array(65).fill(mockQuestion),
      };
      const promise = firstValueFrom(service.startExam());

      const req = httpMock.expectOne(`${baseUrl}/api/exams/start`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);

      const res = await promise;
      expect(res.mode).toBe('exam');
      expect(res.count).toBe(65);
      expect(res.durationMinutes).toBe(130);
      expect(res.items.length).toBe(65);
    });

    it('should handle error when starting exam fails', async () => {
      const promise = firstValueFrom(service.startExam());

      const req = httpMock.expectOne(`${baseUrl}/api/exams/start`);
      req.flush('Server error', { status: 500, statusText: 'Server Error' });

      await expect(promise).rejects.toThrow();
    });
  });

  describe('createAttempt', () => {
    const attemptDto: CreateAttemptDto = {
      userId: 'user-123',
      questionId: 'q1',
      mode: 'daily',
      selectedChoice: 'A',
    };

    it('should create attempt and return result', async () => {
      const mockResponse = {
        ok: true as const,
        attemptId: 'att-123',
        isCorrect: true,
        correctAnswer: 'A',
      };
      const promise = firstValueFrom(service.createAttempt(attemptDto));

      const req = httpMock.expectOne(`${baseUrl}/api/attempts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(attemptDto);
      req.flush(mockResponse);

      const res = await promise;
      expect(res.ok).toBe(true);
      expect(res.isCorrect).toBe(true);
      expect(res.attemptId).toBe('att-123');
    });

    it('should handle incorrect answer', async () => {
      const mockResponse = {
        ok: true as const,
        attemptId: 'att-124',
        isCorrect: false,
        correctAnswer: 'B',
      };
      const promise = firstValueFrom(service.createAttempt(attemptDto));

      const req = httpMock.expectOne(`${baseUrl}/api/attempts`);
      req.flush(mockResponse);

      const res = await promise;
      expect(res.isCorrect).toBe(false);
      expect(res.correctAnswer).toBe('B');
    });

    it('should handle exam mode', async () => {
      const examAttempt: CreateAttemptDto = { ...attemptDto, mode: 'exam' };
      const mockResponse = {
        ok: true as const,
        attemptId: 'att-125',
        isCorrect: true,
        correctAnswer: 'A',
      };
      const promise = firstValueFrom(service.createAttempt(examAttempt));

      const req = httpMock.expectOne(`${baseUrl}/api/attempts`);
      expect(req.request.body.mode).toBe('exam');
      req.flush(mockResponse);

      const res = await promise;
      expect(res.ok).toBe(true);
    });

    it('should handle error when creating attempt fails', async () => {
      const promise = firstValueFrom(service.createAttempt(attemptDto));

      const req = httpMock.expectOne(`${baseUrl}/api/attempts`);
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });

      await expect(promise).rejects.toThrow();
    });
  });

  describe('dashboardOverview', () => {
    const userId = 'user-123';

    it('should return dashboard overview for user', async () => {
      const mockResponse = {
        ok: true as const,
        totalAttempts: 50,
        correctAttempts: 40,
        successRate: 80,
        questionsPracticed: 30,
        weakConcepts: [
          { conceptKey: 'lambda-basics', wrongCount: 3 },
          { conceptKey: 's3-buckets', wrongCount: 2 },
        ],
      };
      const promise = firstValueFrom(service.dashboardOverview(userId));

      const req = httpMock.expectOne((req) =>
        req.url === `${baseUrl}/api/dashboard/overview` &&
        req.params.get('userId') === userId
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const res = await promise;
      expect(res.ok).toBe(true);
      expect(res.totalAttempts).toBe(50);
      expect(res.successRate).toBe(80);
      expect(res.weakConcepts.length).toBe(2);
    });

    it('should handle null success rate', async () => {
      const mockResponse = {
        ok: true as const,
        totalAttempts: 0,
        correctAttempts: 0,
        successRate: null,
        questionsPracticed: 0,
        weakConcepts: [],
      };
      const promise = firstValueFrom(service.dashboardOverview(userId));

      const req = httpMock.expectOne((req) =>
        req.url === `${baseUrl}/api/dashboard/overview`
      );
      req.flush(mockResponse);

      const res = await promise;
      expect(res.successRate).toBeNull();
      expect(res.questionsPracticed).toBe(0);
    });

    it('should handle error', async () => {
      const promise = firstValueFrom(service.dashboardOverview(userId));

      const req = httpMock.expectOne((req) =>
        req.url === `${baseUrl}/api/dashboard/overview`
      );
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toThrow();
    });
  });

  describe('dashboardDomains', () => {
    const userId = 'user-123';

    it('should return domain statistics', async () => {
      const mockResponse = {
        ok: true as const,
        items: [
          { domainKey: 'development', attempts: 20, correct: 15, successRate: 75 },
          { domainKey: 'security', attempts: 10, correct: 8, successRate: 80 },
        ],
      };
      const promise = firstValueFrom(service.dashboardDomains(userId));

      const req = httpMock.expectOne((req) =>
        req.url === `${baseUrl}/api/dashboard/domains` &&
        req.params.get('userId') === userId
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      const res = await promise;
      expect(res.ok).toBe(true);
      expect(res.items.length).toBe(2);
      expect(res.items[0].domainKey).toBe('development');
    });

    it('should handle empty domains', async () => {
      const mockResponse = {
        ok: true as const,
        items: [],
      };
      const promise = firstValueFrom(service.dashboardDomains(userId));

      const req = httpMock.expectOne((req) =>
        req.url === `${baseUrl}/api/dashboard/domains`
      );
      req.flush(mockResponse);

      const res = await promise;
      expect(res.items).toEqual([]);
    });
  });

  describe('dashboardReset', () => {
    const userId = 'user-123';

    it('should reset dashboard and return deleted count', async () => {
      const mockResponse = {
        ok: true as const,
        deleted: 50,
      };
      const promise = firstValueFrom(service.dashboardReset(userId));

      const req = httpMock.expectOne((req) =>
        req.url === `${baseUrl}/api/dashboard/reset` &&
        req.params.get('userId') === userId
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      const res = await promise;
      expect(res.ok).toBe(true);
      expect(res.deleted).toBe(50);
    });

    it('should handle reset with zero deletions', async () => {
      const mockResponse = {
        ok: true as const,
        deleted: 0,
      };
      const promise = firstValueFrom(service.dashboardReset(userId));

      const req = httpMock.expectOne((req) =>
        req.url === `${baseUrl}/api/dashboard/reset`
      );
      req.flush(mockResponse);

      const res = await promise;
      expect(res.deleted).toBe(0);
    });

    it('should handle reset error', async () => {
      const promise = firstValueFrom(service.dashboardReset(userId));

      const req = httpMock.expectOne((req) =>
        req.url === `${baseUrl}/api/dashboard/reset`
      );
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      await expect(promise).rejects.toThrow();
    });
  });
});
