import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FlashcardsService } from './flashcards.service';
import { environment } from '../../../environments/environment';

describe('FlashcardsService', () => {
  let service: FlashcardsService;
  let httpMock: HttpTestingController;

  const mockFlashcard = {
    id: '1',
    question: "C'est quoi Lambda ?",
    answer: 'Un Robot Cuisinier',
    category: 'Compute',
    difficulty: 'easy' as const,
    tags: ['serverless'],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FlashcardsService],
    });
    service = TestBed.inject(FlashcardsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all flashcards', () => {
    service.getFlashcards().subscribe(flashcards => {
      expect(flashcards).toEqual([mockFlashcard]);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards`);
    expect(req.request.method).toBe('GET');
    req.flush([mockFlashcard]);
  });

  it('should get random flashcards', () => {
    service.getRandomFlashcards(5).subscribe(flashcards => {
      expect(flashcards).toEqual([mockFlashcard]);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/random?count=5`);
    expect(req.request.method).toBe('GET');
    req.flush([mockFlashcard]);
  });

  it('should save progress', () => {
    service.saveProgress('1', true).subscribe(() => {
      expect().nothing();
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/progress`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ flashcardId: '1', known: true });
    req.flush(null);
  });

  it('should get stats', () => {
    const mockStats = {
      totalFlashcards: 10,
      reviewedFlashcards: 5,
      knownFlashcards: 3,
      toReviewFlashcards: 2,
      progressPercentage: 50,
      streakDays: 3,
      lastStudyDate: new Date(),
    };

    service.getStats().subscribe(stats => {
      expect(stats).toEqual(mockStats);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });
});
