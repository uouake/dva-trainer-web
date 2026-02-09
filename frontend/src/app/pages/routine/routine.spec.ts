import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Routine } from './routine';
import { DvaApi, Question } from '../../api/dva-api';
import { UserIdService } from '../../core/user-id.service';
import { environment } from '../../../environments/environment';

describe('Routine', () => {
  let component: Routine;
  let fixture: ComponentFixture<Routine>;
  let httpMock: HttpTestingController;
  let userIdService: UserIdService;
  const baseUrl = environment.apiBaseUrl;
  const mockUserId = 'test-user-123';

  const mockQuestions: Question[] = [
    {
      id: 'q1',
      exam: 'DVA-C02',
      topic: 1,
      questionNumber: 1,
      stem: 'What is AWS Lambda?',
      choices: { A: 'Compute', B: 'Storage', C: 'Database', D: 'Network' },
      answer: 'A',
      conceptKey: 'lambda',
      domainKey: 'development',
      frExplanation: 'Explication Lambda',
      sourceUrl: 'url',
      textHash: 'hash1',
    },
    {
      id: 'q2',
      exam: 'DVA-C02',
      topic: 2,
      questionNumber: 2,
      stem: 'What is S3?',
      choices: { A: 'Compute', B: 'Storage', C: 'Database', D: 'Network' },
      answer: 'B',
      conceptKey: 's3',
      domainKey: 'security',
      frExplanation: 'Explication S3',
      sourceUrl: 'url',
      textHash: 'hash2',
    },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    
    const mockUserIdService = {
      getOrCreate: vi.fn().mockReturnValue(mockUserId),
    };

    await TestBed.configureTestingModule({
      imports: [Routine],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: UserIdService, useValue: mockUserIdService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Routine);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    userIdService = TestBed.inject(UserIdService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in intro phase', () => {
    expect(component.phase).toBe('intro');
  });

  it('should get userId from UserIdService', () => {
    expect(component.userId).toBe(mockUserId);
    expect(userIdService.getOrCreate).toHaveBeenCalled();
  });

  it('should have empty questions initially', () => {
    expect(component.questions).toEqual([]);
  });

  it('should have index at 0', () => {
    expect(component.index).toBe(0);
  });

  it('should start session with specified count', async () => {
    component.startSession(10);

    expect(component.loading).toBe(true);
    expect(component.error).toBeNull();

    const req = httpMock.expectOne((r) =>
      r.url === `${baseUrl}/api/daily-session/start`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ limit: 10 });

    req.flush({ mode: 'daily', limit: 10, items: mockQuestions });
    await fixture.whenStable();

    expect(component.loading).toBe(false);
    expect(component.phase).toBe('session');
    expect(component.questions).toEqual(mockQuestions);
    expect(component.index).toBe(0);
  });

  it('should handle different session sizes', async () => {
    component.startSession(5);

    const req = httpMock.expectOne(`${baseUrl}/api/daily-session/start`);
    expect(req.request.body).toEqual({ limit: 5 });

    req.flush({ mode: 'daily', limit: 5, items: [] });
    await fixture.whenStable();

    expect(component.questions).toEqual([]);
  });

  it('should handle error when starting session', async () => {
    component.startSession(10);

    const req = httpMock.expectOne(`${baseUrl}/api/daily-session/start`);
    req.flush('Server error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(component.loading).toBe(false);
    expect(component.error).toContain('500');
    expect(component.phase).toBe('intro');
  });

  it('should reset state when starting new session', async () => {
    // First session
    component.startSession(5);
    const req1 = httpMock.expectOne(`${baseUrl}/api/daily-session/start`);
    req1.flush({ mode: 'daily', limit: 5, items: mockQuestions });
    await fixture.whenStable();

    // Answer a question
    component.pick('A');
    httpMock.expectOne(`${baseUrl}/api/attempts`).flush({
      ok: true,
      attemptId: 'att1',
      isCorrect: true,
      correctAnswer: 'A',
    });
    await fixture.whenStable();

    expect(component.answers.size).toBe(1);

    // Start new session
    component.startSession(10);
    const req2 = httpMock.expectOne(`${baseUrl}/api/daily-session/start`);
    req2.flush({ mode: 'daily', limit: 10, items: mockQuestions });
    await fixture.whenStable();

    expect(component.answers.size).toBe(0);
    expect(component.correct.size).toBe(0);
    expect(component.index).toBe(0);
    expect(component.selectedChoice).toBeNull();
    expect(component.showFeedback).toBe(false);
  });

  it('should return to intro phase', async () => {
    component.startSession(5);
    const req = httpMock.expectOne(`${baseUrl}/api/daily-session/start`);
    req.flush({ mode: 'daily', limit: 5, items: mockQuestions });
    await fixture.whenStable();

    expect(component.phase).toBe('session');

    component.backToIntro();

    expect(component.phase).toBe('intro');
  });

  it('should return current question', async () => {
    component.startSession(5);
    const req = httpMock.expectOne(`${baseUrl}/api/daily-session/start`);
    req.flush({ mode: 'daily', limit: 5, items: mockQuestions });
    await fixture.whenStable();

    expect(component.current).toEqual(mockQuestions[0]);

    component.index = 1;
    expect(component.current).toEqual(mockQuestions[1]);
  });

  it('should return null when no questions', () => {
    expect(component.current).toBeNull();
  });

  it('should return null when index out of bounds', async () => {
    component.startSession(5);
    const req = httpMock.expectOne(`${baseUrl}/api/daily-session/start`);
    req.flush({ mode: 'daily', limit: 5, items: mockQuestions });
    await fixture.whenStable();

    component.index = 10;
    expect(component.current).toBeNull();
  });

  it('should return sorted choice keys', () => {
    const q: Question = {
      ...mockQuestions[0],
      choices: { C: 'C', A: 'A', B: 'B' },
    };

    expect(component.choiceKeys(q)).toEqual(['A', 'B', 'C']);
  });

  it('should return empty array for undefined choices', () => {
    const q = { ...mockQuestions[0], choices: undefined as any };
    expect(component.choiceKeys(q)).toEqual([]);
  });

  it('should return number of answered questions', () => {
    expect(component.answeredCount()).toBe(0);

    component.answers.set('q1', 'A');
    expect(component.answeredCount()).toBe(1);

    component.answers.set('q2', 'B');
    expect(component.answeredCount()).toBe(2);
  });

  it('should record answer and submit to API', async () => {
    // Start session
    component.startSession(5);
    httpMock.expectOne(`${baseUrl}/api/daily-session/start`).flush({
      mode: 'daily',
      limit: 5,
      items: mockQuestions,
    });
    await fixture.whenStable();

    // Pick answer
    component.pick('A');

    expect(component.selectedChoice).toBe('A');
    expect(component.showFeedback).toBe(true);
    expect(component.answers.get('q1')).toBe('A');
    expect(component.correct.has('q1')).toBe(true);

    // Verify API call
    const req = httpMock.expectOne((r) =>
      r.url === `${baseUrl}/api/attempts` &&
      r.body.userId === mockUserId &&
      r.body.questionId === 'q1' &&
      r.body.mode === 'daily' &&
      r.body.selectedChoice === 'A'
    );
    expect(req.request.method).toBe('POST');

    req.flush({
      ok: true,
      attemptId: 'att1',
      isCorrect: true,
      correctAnswer: 'A',
    });
    await fixture.whenStable();

    expect(component.submittingAttempt).toBe(false);
  });

  it('should handle wrong answer', async () => {
    component.startSession(5);
    httpMock.expectOne(`${baseUrl}/api/daily-session/start`).flush({
      mode: 'daily',
      limit: 5,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.pick('B'); // Wrong answer

    expect(component.answers.get('q1')).toBe('B');
    expect(component.correct.has('q1')).toBe(false);

    httpMock.expectOne(`${baseUrl}/api/attempts`).flush({
      ok: true,
      attemptId: 'att1',
      isCorrect: false,
      correctAnswer: 'A',
    });
    await fixture.whenStable();
  });

  it('should handle API error on pick', async () => {
    component.startSession(5);
    httpMock.expectOne(`${baseUrl}/api/daily-session/start`).flush({
      mode: 'daily',
      limit: 5,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.pick('A');
    await fixture.whenStable();

    httpMock.expectOne(`${baseUrl}/api/attempts`).flush(
      'Server error',
      { status: 500, statusText: 'Server Error' }
    );
    await fixture.whenStable();

    expect(component.error).toContain('500');
    expect(component.submittingAttempt).toBe(false);
    expect(component.answers.get('q1')).toBe('A'); // Still recorded locally
  });

  it('should not allow double submission', async () => {
    component.startSession(5);
    httpMock.expectOne(`${baseUrl}/api/daily-session/start`).flush({
      mode: 'daily',
      limit: 5,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.pick('A');
    await fixture.whenStable();

    expect(component.submittingAttempt).toBe(true);

    // Try to pick again
    component.pick('B');

    expect(component.selectedChoice).toBe('A');
    expect(component.answers.get('q1')).toBe('A');

    // Complete the first request
    httpMock.expectOne(`${baseUrl}/api/attempts`).flush({
      ok: true,
      attemptId: 'att1',
      isCorrect: true,
      correctAnswer: 'A',
    });
    await fixture.whenStable();
  });

  it('should not allow answering same question twice', async () => {
    component.startSession(5);
    httpMock.expectOne(`${baseUrl}/api/daily-session/start`).flush({
      mode: 'daily',
      limit: 5,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.pick('A');
    httpMock.expectOne(`${baseUrl}/api/attempts`).flush({
      ok: true,
      attemptId: 'att1',
      isCorrect: true,
      correctAnswer: 'A',
    });
    await fixture.whenStable();

    // Try to answer again
    component.pick('B');

    expect(component.selectedChoice).toBe('A');
  });

  it('should not do anything if no current question', () => {
    component.questions = [];
    component.pick('A');

    expect(component.selectedChoice).toBeNull();
  });

  it('should reset feedback and move to next question', async () => {
    component.startSession(5);
    httpMock.expectOne(`${baseUrl}/api/daily-session/start`).flush({
      mode: 'daily',
      limit: 5,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.selectedChoice = 'A';
    component.showFeedback = true;

    component.next();

    expect(component.selectedChoice).toBeNull();
    expect(component.showFeedback).toBe(false);
    expect(component.index).toBe(1);
  });

  it('should go to results phase after last question', async () => {
    component.startSession(5);
    httpMock.expectOne(`${baseUrl}/api/daily-session/start`).flush({
      mode: 'daily',
      limit: 5,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.index = 1; // Last question

    component.next();

    expect(component.phase).toBe('results');
  });

  it('should return true for correct answer', async () => {
    component.startSession(5);
    httpMock.expectOne(`${baseUrl}/api/daily-session/start`).flush({
      mode: 'daily',
      limit: 5,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.selectedChoice = 'A';
    expect(component.isCorrect()).toBe(true);
  });

  it('should return false for wrong answer', async () => {
    component.startSession(5);
    httpMock.expectOne(`${baseUrl}/api/daily-session/start`).flush({
      mode: 'daily',
      limit: 5,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.selectedChoice = 'B';
    expect(component.isCorrect()).toBe(false);
  });

  it('should return false when no answer selected', async () => {
    component.startSession(5);
    httpMock.expectOne(`${baseUrl}/api/daily-session/start`).flush({
      mode: 'daily',
      limit: 5,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.selectedChoice = null;
    expect(component.isCorrect()).toBe(false);
  });

  it('should return 0 progress when no questions', () => {
    expect(component.progressPercent()).toBe(0);
  });

  it('should calculate progress correctly', async () => {
    component.startSession(5);
    httpMock.expectOne(`${baseUrl}/api/daily-session/start`).flush({
      mode: 'daily',
      limit: 5,
      items: mockQuestions,
    });
    await fixture.whenStable();

    expect(component.progressPercent()).toBe(50); // (0+1)/2 * 100

    component.index = 1;
    expect(component.progressPercent()).toBe(100); // (1+1)/2 * 100
  });
});
