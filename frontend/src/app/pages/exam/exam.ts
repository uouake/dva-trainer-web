import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DvaApi, Question } from '../../api/dva-api';

// Exam page redesigned to match aws-exam-buddy.
//
// Phases:
// - intro: exam information + CTA
// - exam: dark mode exam runner (timer, navigation, grid panel)
// - results: simple results view (still MVP)

type Phase = 'intro' | 'exam' | 'results';

@Component({
  selector: 'app-exam',
  imports: [CommonModule, RouterLink],
  templateUrl: './exam.html',
  styleUrl: './exam.scss',
})
export class Exam implements OnDestroy {
  phase: Phase = 'intro';

  loading = false;
  error: string | null = null;

  questions: Question[] = [];
  index = 0;

  // Exam settings
  durationMinutes = 130;
  secondsLeft = this.durationMinutes * 60;

  // State
  flags = new Set<string>();
  answers = new Map<string, string>(); // questionId -> chosen letter

  // UI
  showGrid = true; // desktop panel on/off
  showSubmitConfirm = false;

  private timer: number | null = null;

  constructor(private readonly api: DvaApi) {}

  ngOnDestroy() {
    this.stopTimer();
  }

  startExam() {
    this.loading = true;
    this.error = null;

    this.questions = [];
    this.index = 0;
    this.flags.clear();
    this.answers.clear();
    this.showSubmitConfirm = false;

    this.api.startExam().subscribe({
      next: (res) => {
        this.questions = res.items;
        this.durationMinutes = res.durationMinutes;
        this.secondsLeft = res.durationMinutes * 60;
        this.loading = false;
        this.phase = 'exam';
        this.startTimer();
      },
      error: (err) => {
        this.error = err?.message ?? String(err);
        this.loading = false;
        this.phase = 'intro';
      },
    });
  }

  submit() {
    this.stopTimer();
    this.phase = 'results';
  }

  handleTimeUp() {
    this.secondsLeft = 0;
    this.submit();
  }

  get current(): Question | null {
    return this.questions[this.index] ?? null;
  }

  choiceKeys(q: Question): string[] {
    return Object.keys(q.choices ?? {}).sort();
  }

  pick(choice: string) {
    const q = this.current;
    if (!q) return;
    this.answers.set(q.id, choice);
  }

  chosenFor(q: Question): string | null {
    return this.answers.get(q.id) ?? null;
  }

  answeredCount(): number {
    return this.answers.size;
  }

  toggleFlag() {
    const q = this.current;
    if (!q) return;
    if (this.flags.has(q.id)) this.flags.delete(q.id);
    else this.flags.add(q.id);
  }

  isFlagged(q: Question): boolean {
    return this.flags.has(q.id);
  }

  goTo(i: number) {
    if (i >= 0 && i < this.questions.length) this.index = i;
  }

  prev() {
    if (this.index > 0) this.index -= 1;
  }

  next() {
    if (this.index < this.questions.length - 1) this.index += 1;
  }

  score() {
    let correct = 0;
    for (const q of this.questions) {
      const a = this.answers.get(q.id);
      if (a && a === q.answer) correct += 1;
    }
    return {
      correct,
      total: this.questions.length,
      percent: this.questions.length ? Math.round((correct / this.questions.length) * 100) : 0,
    };
  }

  formatTime(sec: number): string {
    const s = Math.max(0, sec);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    const h = Math.floor(mm / 60);
    const m = mm % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(ss)}`;
  }

  private startTimer() {
    this.stopTimer();
    this.timer = window.setInterval(() => {
      this.secondsLeft -= 1;
      if (this.secondsLeft <= 0) {
        this.secondsLeft = 0;
        this.handleTimeUp();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
}
