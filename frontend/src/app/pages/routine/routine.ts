import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DvaApi, Question } from '../../api/dva-api';

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

  constructor(private readonly api: DvaApi) {}

  startSession(count: number) {
    this.loading = true;
    this.error = null;
    this.questions = [];
    this.index = 0;
    this.selectedChoice = null;
    this.showFeedback = false;

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
    // For MVP, we count as answered if selectedChoice exists for current index,
    // but since we don't persist per-question answers in routine yet,
    // show 0 until we implement attempts persistence.
    return 0;
  }

  pick(choice: string) {
    if (!this.current) return;
    this.selectedChoice = choice;
    this.showFeedback = true;
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
