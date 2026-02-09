import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Exam } from './exam';
import { Question } from '../../api/dva-api';
import { UserIdService } from '../../core/user-id.service';
import { environment } from '../../../environments/environment';

describe('Exam', () => {
  let component: Exam;
  let fixture: ComponentFixture<Exam>;
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
      choices: { A: 'Compute', B: 'Storage' },
      answer: 'A',
      conceptKey: 'lambda',
      domainKey: 'development',
      frExplanation: 'Explication',
      sourceUrl: 'url',
      textHash: 'hash1',
    },
    {
      id: 'q2',
      exam: 'DVA-C02',
      topic: 2,
      questionNumber: 2,
      stem: 'What is S3?',
      choices: { A: 'Compute', B: 'Storage' },
      answer: 'B',
      conceptKey: 's3',
      domainKey: 'security',
      frExplanation: 'Explication',
      sourceUrl: 'url',
      textHash: 'hash2',
    },
    {
      id: 'q3',
      exam: 'DVA-C02',
      topic: 3,
      questionNumber: 3,
      stem: 'What is EC2?',
      choices: { A: 'Compute', B: 'Storage' },
      answer: 'A',
      conceptKey: 'ec2',
      domainKey: 'deployment',
      frExplanation: 'Explication',
      sourceUrl: 'url',
      textHash: 'hash3',
    },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    
    const mockUserIdService = {
      getOrCreate: vi.fn().mockReturnValue(mockUserId),
    };

    await TestBed.configureTestingModule({
      imports: [Exam],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: UserIdService, useValue: mockUserIdService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Exam);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    userIdService = TestBed.inject(UserIdService);
  });

  afterEach(() => {
    httpMock.verify();
    component.ngOnDestroy();
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

  it('should have default duration of 130 minutes', () => {
    expect(component.durationMinutes).toBe(130);
    expect(component.secondsLeft).toBe(130 * 60);
  });

  it('should have empty questions initially', () => {
    expect(component.questions).toEqual([]);
  });

  it('should have index at 0', () => {
    expect(component.index).toBe(0);
  });

  it('should have empty flags set', () => {
    expect(component.flags.size).toBe(0);
  });

  it('should have empty answers map', () => {
    expect(component.answers.size).toBe(0);
  });

  it('should have showGrid enabled by default', () => {
    expect(component.showGrid).toBe(true);
  });

  it('should start exam and load questions', async () => {
    component.startExam();

    expect(component.loading).toBe(true);
    expect(component.error).toBeNull();

    const req = httpMock.expectOne((r) =>
      r.url === `${baseUrl}/api/exams/start`
    );
    expect(req.request.method).toBe('POST');

    req.flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    expect(component.loading).toBe(false);
    expect(component.phase).toBe('exam');
    expect(component.questions).toEqual(mockQuestions);
    expect(component.durationMinutes).toBe(130);
    expect(component.secondsLeft).toBe(130 * 60);
  });

  it('should handle custom duration from server', async () => {
    component.startExam();

    const req = httpMock.expectOne(`${baseUrl}/api/exams/start`);
    req.flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 90,
      items: mockQuestions,
    });
    await fixture.whenStable();

    expect(component.durationMinutes).toBe(90);
    expect(component.secondsLeft).toBe(90 * 60);
  });

  it('should reset state when starting new exam', async () => {
    component.answers.set('q1', 'A');
    component.flags.add('q2');
    component.index = 1;
    component.showSubmitConfirm = true;

    component.startExam();

    const req = httpMock.expectOne(`${baseUrl}/api/exams/start`);
    req.flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    expect(component.answers.size).toBe(0);
    expect(component.flags.size).toBe(0);
    expect(component.index).toBe(0);
    expect(component.showSubmitConfirm).toBe(false);
  });

  it('should handle error when starting exam', async () => {
    component.startExam();

    const req = httpMock.expectOne(`${baseUrl}/api/exams/start`);
    req.flush('Server error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(component.loading).toBe(false);
    expect(component.error).toContain('500');
    expect(component.phase).toBe('intro');
  });

  it('should submit and go to results', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.submit();
    expect(component.phase).toBe('results');
  });

  it('should handle time up', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.secondsLeft = 10;
    component.handleTimeUp();

    expect(component.secondsLeft).toBe(0);
    expect(component.phase).toBe('results');
  });

  it('should return null when no questions', () => {
    expect(component.current).toBeNull();
  });

  it('should return current question', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    expect(component.current).toEqual(mockQuestions[0]);

    component.index = 1;
    expect(component.current).toEqual(mockQuestions[1]);
  });

  it('should return sorted choice keys', () => {
    const q: Question = {
      ...mockQuestions[0],
      choices: { C: 'C', A: 'A' },
    };

    expect(component.choiceKeys(q)).toEqual(['A', 'C']);
  });

  it('should record answer and submit to API', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.pick('A');
    expect(component.answers.get('q1')).toBe('A');

    const req = httpMock.expectOne((r) =>
      r.url === `${baseUrl}/api/attempts` &&
      r.body.userId === mockUserId &&
      r.body.questionId === 'q1' &&
      r.body.mode === 'exam' &&
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

  it('should handle API error on pick', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
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
    expect(component.answers.get('q1')).toBe('A');
  });

  it('should not allow double submission', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.pick('A');
    await fixture.whenStable();

    expect(component.submittingAttempt).toBe(true);

    component.pick('B');
    expect(component.answers.get('q1')).toBe('A');

    httpMock.expectOne(`${baseUrl}/api/attempts`).flush({
      ok: true,
      attemptId: 'att1',
      isCorrect: true,
      correctAnswer: 'A',
    });
    await fixture.whenStable();
  });

  it('should not allow answering same question twice', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
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

    component.pick('B');
    expect(component.answers.get('q1')).toBe('A');
  });

  it('should return chosen answer for question', () => {
    component.answers.set('q1', 'A');
    component.answers.set('q2', 'B');

    expect(component.chosenFor(mockQuestions[0])).toBe('A');
    expect(component.chosenFor(mockQuestions[1])).toBe('B');
  });

  it('should return null if no answer for question', () => {
    expect(component.chosenFor(mockQuestions[0])).toBeNull();
  });

  it('should return number of answered questions', () => {
    expect(component.answeredCount()).toBe(0);

    component.answers.set('q1', 'A');
    expect(component.answeredCount()).toBe(1);

    component.answers.set('q2', 'B');
    component.answers.set('q3', 'C');
    expect(component.answeredCount()).toBe(3);
  });

  it('should flag current question', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    expect(component.flags.has('q1')).toBe(false);
    component.toggleFlag();
    expect(component.flags.has('q1')).toBe(true);
  });

  it('should unflag already flagged question', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.toggleFlag();
    expect(component.flags.has('q1')).toBe(true);
    component.toggleFlag();
    expect(component.flags.has('q1')).toBe(false);
  });

  it('should check if question is flagged', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    expect(component.isFlagged(mockQuestions[0])).toBe(false);
    component.toggleFlag();
    expect(component.isFlagged(mockQuestions[0])).toBe(true);
  });

  it('should go to specific question index', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.goTo(1);
    expect(component.index).toBe(1);
    component.goTo(2);
    expect(component.index).toBe(2);
  });

  it('should not go below 0', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.goTo(-1);
    expect(component.index).toBe(0);
  });

  it('should not go beyond last question', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.goTo(10);
    expect(component.index).toBe(0);
  });

  it('should go to previous question', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.index = 2;
    component.prev();
    expect(component.index).toBe(1);
    component.prev();
    expect(component.index).toBe(0);
  });

  it('should not go before first question', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.prev();
    expect(component.index).toBe(0);
  });

  it('should go to next question', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.next();
    expect(component.index).toBe(1);
    component.next();
    expect(component.index).toBe(2);
  });

  it('should not go beyond last question on next', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.index = 2;
    component.next();
    expect(component.index).toBe(2);
  });

  it('should calculate perfect score', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.answers.set('q1', 'A');
    component.answers.set('q2', 'B');
    component.answers.set('q3', 'A');

    const score = component.score();
    expect(score.correct).toBe(3);
    expect(score.total).toBe(3);
    expect(score.percent).toBe(100);
  });

  it('should handle partial correct answers', async () => {
    component.startExam();
    httpMock.expectOne(`${baseUrl}/api/exams/start`).flush({
      mode: 'exam',
      count: 65,
      durationMinutes: 130,
      items: mockQuestions,
    });
    await fixture.whenStable();

    component.answers.set('q1', 'A');
    component.answers.set('q2', 'A');
    component.answers.set('q3', 'B');

    const score = component.score();
    expect(score.correct).toBe(1);
    expect(score.total).toBe(3);
    expect(score.percent).toBe(33);
  });

  it('should handle no answers', () => {
    component.questions = mockQuestions;

    const score = component.score();
    expect(score.correct).toBe(0);
    expect(score.total).toBe(3);
    expect(score.percent).toBe(0);
  });

  it('should handle empty questions', () => {
    const score = component.score();
    expect(score.correct).toBe(0);
    expect(score.total).toBe(0);
    expect(score.percent).toBe(0);
  });

  it('should format time correctly', () => {
    expect(component.formatTime(0)).toBe('00:00:00');
    expect(component.formatTime(1)).toBe('00:00:01');
    expect(component.formatTime(60)).toBe('00:01:00');
    expect(component.formatTime(61)).toBe('00:01:01');
    expect(component.formatTime(3600)).toBe('01:00:00');
    expect(component.formatTime(3661)).toBe('01:01:01');
    expect(component.formatTime(3723)).toBe('01:02:03');
  });

  it('should handle large time values', () => {
    expect(component.formatTime(7800)).toBe('02:10:00');
  });

  it('should not show negative time', () => {
    expect(component.formatTime(-10)).toBe('00:00:00');
  });
});
