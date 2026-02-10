import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Routine } from './routine';
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

describe('Routine Component', () => {
  let component: Routine;
  let fixture: ComponentFixture<Routine>;
  let api: DvaApi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Routine],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: UserIdService, useClass: MockUserIdService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Routine);
    component = fixture.componentInstance;
    api = TestBed.inject(DvaApi);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the routine title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Routine Quotidienne');
  });

  it('should have "Commencer" buttons for different session sizes', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Should have buttons for 5, 10, 15 questions
    expect(compiled.textContent?.toLowerCase()).toContain('commencer');
  });

  it('should start a session when clicking a start button', () => {
    const mockResponse = {
      mode: 'daily' as const,
      limit: 5,
      items: [
        {
          id: 'test-q-1',
          exam: 'dva-c02',
          topic: 1,
          questionNumber: 1,
          stem: 'Test question',
          choices: { A: 'Option A', B: 'Option B' },
          answer: 'A',
          requiredAnswers: 1,
          conceptKey: 'test-concept',
          domainKey: 'development',
          frExplanation: 'Test explanation',
          frExplanationPedagogique: undefined,
          sourceUrl: 'https://example.com',
          textHash: 'hash123',
        },
      ],
    };

    vi.spyOn(api, 'startDailySession').and.returnValue(of(mockResponse));

    fixture.detectChanges();
    
    // Call startSession directly to test the method
    component.startSession(5);
    
    expect(api.startDailySession).toHaveBeenCalledWith(5);
    expect(component.phase).toBe('session');
    expect(component.questions.length).toBe(1);
  });

  it('should handle session start errors', () => {
    vi.spyOn(api, 'startDailySession').and.returnValue(
      new Observable((observer) => {
        observer.error(new Error('Network error'));
      })
    );

    fixture.detectChanges();
    component.startSession(5);

    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
  });

  it('should track answers correctly', () => {
    component.questions = [
      {
        id: 'test-q-1',
        exam: 'dva-c02',
        topic: 1,
        questionNumber: 1,
        stem: 'Test question',
        choices: { A: 'Option A', B: 'Option B' },
        answer: 'A',
        requiredAnswers: 1,
        conceptKey: 'test-concept',
        domainKey: 'development',
        frExplanation: 'Test explanation',
        sourceUrl: 'https://example.com',
        textHash: 'hash123',
      },
    ];
    component.phase = 'session';
    component.index = 0;

    vi.spyOn(api, 'createAttempt').and.returnValue(
      of({
        ok: true,
        attemptId: 'attempt-1',
        isCorrect: true,
        correctAnswer: 'A',
      })
    );

    component.pick('A');

    expect(component.answers.get('test-q-1')).toBe('A');
    expect(component.correct.has('test-q-1')).toBe(true);
    expect(component.showFeedback).toBe(true);
  });

  it('should navigate to next question', () => {
    component.questions = [
      {
        id: 'test-q-1',
        exam: 'dva-c02',
        topic: 1,
        questionNumber: 1,
        stem: 'Test question 1',
        choices: { A: 'Option A' },
        answer: 'A',
        requiredAnswers: 1,
        conceptKey: 'test',
        frExplanation: 'Test',
        sourceUrl: 'https://example.com',
        textHash: 'hash1',
      },
      {
        id: 'test-q-2',
        exam: 'dva-c02',
        topic: 1,
        questionNumber: 2,
        stem: 'Test question 2',
        choices: { A: 'Option A' },
        answer: 'A',
        requiredAnswers: 1,
        conceptKey: 'test',
        frExplanation: 'Test',
        sourceUrl: 'https://example.com',
        textHash: 'hash2',
      },
    ];
    component.phase = 'session';
    component.index = 0;
    component.selectedChoice = 'A';
    component.showFeedback = true;

    component.next();

    expect(component.index).toBe(1);
    expect(component.selectedChoice).toBeNull();
    expect(component.showFeedback).toBe(false);
  });

  it('should show results after last question', () => {
    component.questions = [
      {
        id: 'test-q-1',
        exam: 'dva-c02',
        topic: 1,
        questionNumber: 1,
        stem: 'Test question',
        choices: { A: 'Option A' },
        answer: 'A',
        requiredAnswers: 1,
        conceptKey: 'test',
        frExplanation: 'Test',
        sourceUrl: 'https://example.com',
        textHash: 'hash1',
      },
    ];
    component.phase = 'session';
    component.index = 0;
    component.selectedChoice = 'A';
    component.showFeedback = true;

    component.next();

    expect(component.phase).toBe('results');
  });

  it('should go back to intro', () => {
    component.phase = 'session';
    component.backToIntro();
    expect(component.phase).toBe('intro');
  });

  it('should calculate progress percentage correctly', () => {
    component.questions = [
      { id: 'q1' } as any,
      { id: 'q2' } as any,
      { id: 'q3' } as any,
      { id: 'q4' } as any,
    ];
    component.index = 1;

    expect(component.progressPercent()).toBe(50);
  });

  it('should return correct choice keys', () => {
    const question = {
      choices: { B: 'Option B', A: 'Option A', C: 'Option C' },
    } as any;

    const keys = component.choiceKeys(question);
    expect(keys).toEqual(['A', 'B', 'C']);
  });
});

// Need to import Observable for the error test
import { Observable } from 'rxjs';
