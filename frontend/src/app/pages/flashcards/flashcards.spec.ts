import { ComponentFixture, TestBed } from '@angular/core/testing';
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
      conceptKey: 'lambda',
      front: "C'est quoi Lambda ?",
      back: 'Un Robot Cuisinier',
      category: 'Compute',
      difficulty: 1,
    },
    {
      id: '2',
      conceptKey: 's3',
      front: "C'est quoi S3 ?",
      back: 'Un Casier Infini',
      category: 'Storage',
      difficulty: 1,
    },
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('FlashcardsService', [
      'getRandomFlashcards',
      'saveProgress',
    ]);

    await TestBed.configureTestingModule({
      imports: [FlashcardsPage, HttpClientTestingModule],
      providers: [{ provide: FlashcardsService, useValue: spy }],
    }).compileComponents();

    flashcardsService = TestBed.inject(FlashcardsService) as jasmine.SpyObj<FlashcardsService>;
    flashcardsService.getRandomFlashcards.and.returnValue(of(mockFlashcards));
    flashcardsService.saveProgress.and.returnValue(of(void 0));

    fixture = TestBed.createComponent(FlashcardsPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load flashcards on init', () => {
    fixture.detectChanges();
    expect(flashcardsService.getRandomFlashcards).toHaveBeenCalledWith(10);
    expect(component.flashcards()).toEqual(mockFlashcards);
    expect(component.loading()).toBeFalse();
  });

  it('should handle error when loading flashcards', () => {
    flashcardsService.getRandomFlashcards.and.returnValue(throwError(() => new Error('Error')));
    fixture.detectChanges();
    expect(component.error()).toBe('Impossible de charger les flashcards. Veuillez réessayer.');
    expect(component.loading()).toBeFalse();
  });

  it('should return current card', () => {
    fixture.detectChanges();
    expect(component.currentCard()).toEqual(mockFlashcards[0]);
  });

  it('should flip card', () => {
    fixture.detectChanges();
    expect(component.isFlipped()).toBeFalse();
    component.flipCard();
    expect(component.isFlipped()).toBeTrue();
    component.flipCard();
    expect(component.isFlipped()).toBeFalse();
  });

  it('should mark card as known and go to next', () => {
    fixture.detectChanges();
    component.markAsKnown();
    expect(flashcardsService.saveProgress).toHaveBeenCalledWith('1', true);
    expect(component.progress().known).toBe(1);
  });

  it('should mark card for review and go to next', () => {
    fixture.detectChanges();
    component.markForReview();
    expect(flashcardsService.saveProgress).toHaveBeenCalledWith('1', false);
    expect(component.progress().review).toBe(1);
  });

  it('should go to next card', () => {
    fixture.detectChanges();
    component.nextCard();
    expect(component.currentIndex()).toBe(1);
  });

  it('should complete session after last card', () => {
    fixture.detectChanges();
    component.currentIndex.set(1); // Dernière carte
    component.nextCard();
    expect(component.sessionComplete()).toBeTrue();
  });

  it('should restart session', () => {
    fixture.detectChanges();
    component.currentIndex.set(1);
    component.sessionComplete.set(true);
    component.restartSession();
    expect(component.currentIndex()).toBe(0);
    expect(component.sessionComplete()).toBeFalse();
  });

  it('should calculate progress width correctly', () => {
    fixture.detectChanges();
    expect(component.getProgressWidth()).toBe('0%');
    component.currentIndex.set(1);
    expect(component.getProgressWidth()).toBe('100%');
  });
});
