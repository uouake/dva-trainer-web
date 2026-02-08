import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DvaApi, Question } from '../../api/dva-api';
import { UserIdService } from '../../core/user-id.service';

// Daily routine redesigned to match aws-exam-buddy.
//
// We implement 2 phases:
// - intro (choose 5/10/15)
// - session (question card + progress bar + next button after feedback)

type Phase = 'intro' | 'session' | 'results';

@Component({
  selector: 'app-routine',
  imports: [CommonModule, RouterLink],
  templateUrl: './routine.html',
  styleUrl: './routine.scss',
})
export class Routine {
  phase: Phase = 'intro';

  loading = false;
  error: string | null = null;

  questions: Question[] = [];
  index = 0;

  // current answer
  selectedChoice: string | null = null;
  showFeedback = false;
  submittingAttempt = false;

  // session state
  userId = '';
  answers = new Map<string, string>(); // questionId -> choice
  correct = new Set<string>(); // questionId

  constructor(
    private readonly api: DvaApi,
    private readonly userIdService: UserIdService,
  ) {
    this.userId = this.userIdService.getOrCreate();
  }

  startSession(count: number) {
    this.loading = true;
    this.error = null;
    this.questions = [];
    this.index = 0;
    this.selectedChoice = null;
    this.showFeedback = false;
    this.submittingAttempt = false;
    this.answers.clear();
    this.correct.clear();

    this.api.startDailySession(count).subscribe({
      next: (res) => {
        this.questions = res.items;
        this.phase = 'session';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? String(err);
        this.loading = false;
      },
    });
  }

  backToIntro() {
    this.phase = 'intro';
  }

  get current(): Question | null {
    return this.questions[this.index] ?? null;
  }

  choiceKeys(q: Question): string[] {
    return Object.keys(q.choices ?? {}).sort();
  }

  answeredCount(): number {
    return this.answers.size;
  }

  pick(choice: string) {
    const q = this.current;
    if (!q) return;

    // V1 rule: first answer wins (prevents double counting attempts).
    if (this.answers.has(q.id) || this.submittingAttempt) return;

    this.selectedChoice = choice;
    this.showFeedback = true;

    // Optimistic local tracking (so results still work even if API is down).
    this.answers.set(q.id, choice);
    if (choice === q.answer) this.correct.add(q.id);

    this.submittingAttempt = true;
    this.api
      .createAttempt({
        userId: this.userId,
        questionId: q.id,
        mode: 'daily',
        selectedChoice: choice,
      })
      .subscribe({
        next: (res) => {
          // Source of truth for correctness is backend.
          if (res.isCorrect) this.correct.add(q.id);
          else this.correct.delete(q.id);
          this.submittingAttempt = false;
        },
        error: (err) => {
          this.error = err?.message ?? String(err);
          this.submittingAttempt = false;
        },
      });
  }

  next() {
    // reset feedback for next question
    this.selectedChoice = null;
    this.showFeedback = false;

    if (this.index < this.questions.length - 1) {
      this.index += 1;
    } else {
      this.phase = 'results';
    }
  }

  isCorrect(): boolean {
    if (!this.current || !this.selectedChoice) return false;
    return this.selectedChoice === this.current.answer;
  }

  progressPercent(): number {
    if (!this.questions.length) return 0;
    return ((this.index + 1) / this.questions.length) * 100;
  }
}
