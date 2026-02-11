import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FlashcardsPage } from './flashcards';
import { FlashcardsService } from './flashcards.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('FlashcardsPage', () => {
  let component: FlashcardsPage;
  let fixture: ComponentFixture<FlashcardsPage>;
  let flashcardsService: jasmine.SpyObj<FlashcardsService>;

  const mockFlashcards = [
    {
      id: '1',
      question: "C'est quoi Lambda ?",
      answer: 'Un Robot Cuisinier',
      category: 'Compute',
      difficulty: 'easy' as const,
      tags: ['serverless'],
    },
    {
      id: '2',
      question: "C'est quoi S3 ?",
      answer: 'Un Casier Infini',
      category: 'Storage',
      difficulty: 'easy' as const,
      tags: ['storage'],
    },
  ];

  const mockStats = {
    totalFlashcards: 30,
    reviewedFlashcards: 10,
    knownFlashcards: 5,
    toReviewFlashcards: 5,
    progressPercentage: 33,
    streakDays: 3,
    lastStudyDate: new Date(),
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('FlashcardsService', [
      'getRandomFlashcards',
      'getStats',
      'saveProgress',
    ]);

    await TestBed.configureTestingModule({
      imports: [FlashcardsPage, HttpClientTestingModule],
      providers: [{ provide: FlashcardsService, useValue: spy }],
    }).compileComponents();

    flashcardsService = TestBed.inject(FlashcardsService) as jasmine.SpyObj<FlashcardsService>;
    flashcardsService.getRandomFlashcards.and.returnValue(of(mockFlashcards));
    flashcardsService.getStats.and.returnValue(of(mockStats));
    flashcardsService.saveProgress.and.returnValue(of(void 0));

    fixture = TestBed.createComponent(FlashcardsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load flashcards and stats on init', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(flashcardsService.getRandomFlashcards).toHaveBeenCalledWith(10);
    expect(flashcardsService.getStats).toHaveBeenCalled();
    expect(component.state()).toBe('study');
    expect(component.flashcards()).toEqual(mockFlashcards);
  }));

  it('should handle error when loading flashcards', fakeAsync(() => {
    flashcardsService.getRandomFlashcards.and.returnValue(throwError(() => new Error('Error')));
    fixture.detectChanges();
    tick();
    expect(component.state()).toBe('error');
    expect(component.errorMessage()).toBe('Impossible de charger les flashcards. Veuillez réessayer.');
  }));

  it('should show empty state when no flashcards', fakeAsync(() => {
    flashcardsService.getRandomFlashcards.and.returnValue(of([]));
    fixture.detectChanges();
    tick();
    expect(component.state()).toBe('empty');
  }));

  it('should return current flashcard', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.currentFlashcard()).toEqual(mockFlashcards[0]);
  }));

  it('should flip card', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.flipState()).toBe('front');
    component.flipCard();
    expect(component.flipState()).toBe('back');
    component.flipCard();
    expect(component.flipState()).toBe('front');
  }));

  it('should mark card as known and go to next', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    component.markAsKnown();
    expect(flashcardsService.saveProgress).toHaveBeenCalledWith('1', true);
    expect(component.sessionResults().known).toBe(1);
    expect(component.flipState()).toBe('front');
  }));

  it('should mark card for review and go to next', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    component.markForReview();
    expect(flashcardsService.saveProgress).toHaveBeenCalledWith('1', false);
    expect(component.sessionResults().review).toBe(1);
  }));

  it('should complete session after last card', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    component.markAsKnown(); // Card 1
    tick();
    component.markAsKnown(); // Card 2 (last)
    tick();
    expect(component.state()).toBe('summary');
  }));

  it('should calculate success rate correctly', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.getSuccessRate()).toBe(0);
    component.sessionResults.set({ known: 8, review: 2 });
    expect(component.getSuccessRate()).toBe(80);
  }));

  it('should restart session', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    component.state.set('summary');
    component.startNewSession();
    tick();
    expect(component.state()).toBe('study');
    expect(component.currentIndex()).toBe(0);
  }));

  it('should get difficulty label', () => {
    expect(component.getDifficultyLabel('easy')).toBe('Facile');
    expect(component.getDifficultyLabel('medium')).toBe('Moyen');
    expect(component.getDifficultyLabel('hard')).toBe('Difficile');
  });

  it('should get difficulty color', () => {
    expect(component.getDifficultyColor('easy')).toBe('difficulty-easy');
    expect(component.getDifficultyColor('medium')).toBe('difficulty-medium');
    expect(component.getDifficultyColor('hard')).toBe('difficulty-hard');
  });

  it('should calculate progress correctly', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.progressText()).toBe('1 / 2');
    expect(component.progressPercentage()).toBe(0);
    component.currentIndex.set(1);
    expect(component.progressText()).toBe('2 / 2');
    expect(component.progressPercentage()).toBe(50);
  }));
});
