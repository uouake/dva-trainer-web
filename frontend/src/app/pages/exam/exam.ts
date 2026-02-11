import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DvaApi, Question } from '../../api/dva-api';
import { UserIdService } from '../../core/user-id.service';
import { GlossaryPipe } from '../../pipes/glossary.pipe';
import { GlossaryHandlerDirective } from '../../components/glossary/glossary-handler.directive';
import { GlossaryTooltipPopupComponent } from '../../components/glossary/glossary-tooltip-popup.component';

// Exam page redesigned to match aws-exam-buddy.
//
// Phases:
// - intro: exam information + CTA
// - exam: dark mode exam runner (timer, navigation, grid panel)
// - results: simple results view (still MVP)

type Phase = 'intro' | 'exam' | 'results';

@Component({
  selector: 'app-exam',
  imports: [CommonModule, RouterLink, GlossaryPipe, GlossaryHandlerDirective, GlossaryTooltipPopupComponent],
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
  // Pour les questions simples: Map<questionId, choice>
  // Pour les questions multi: Map<questionId, Set<choice>>
  answers = new Map<string, string | Set<string>>();

  // UI
  showGrid = true; // desktop panel on/off
  showSubmitConfirm = false;

  private timer: number | null = null;

  userId = '';
  submittingAttempt = false;

  constructor(
    private readonly api: DvaApi,
    private readonly userIdService: UserIdService,
  ) {
    this.userId = this.userIdService.getOrCreate();
  }

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

  // Vérifie si la question actuelle est une question à choix multiples
  isMultiChoice(q: Question | null): boolean {
    return (q?.requiredAnswers ?? 1) > 1;
  }

  choiceKeys(q: Question): string[] {
    return Object.keys(q.choices ?? {}).sort();
  }

  // Gère la sélection d'une réponse (simple ou multiple)
  pick(choice: string) {
    const q = this.current;
    if (!q || this.submittingAttempt) return;

    const isMulti = this.isMultiChoice(q);
    const maxAnswers = q.requiredAnswers;

    if (isMulti) {
      // Gestion des réponses multiples
      let currentChoices = this.answers.get(q.id) as Set<string> | undefined;
      
      if (!currentChoices) {
        currentChoices = new Set<string>();
      } else {
        // Créer une nouvelle copie pour la réactivité
        currentChoices = new Set(currentChoices);
      }

      if (currentChoices.has(choice)) {
        // Désélectionner si déjà sélectionné
        currentChoices.delete(choice);
      } else {
        // Vérifier qu'on ne dépasse pas le nombre max de réponses
        if (currentChoices.size < maxAnswers) {
          currentChoices.add(choice);
        }
      }

      // Mettre à jour la Map
      if (currentChoices.size === 0) {
        this.answers.delete(q.id);
      } else {
        this.answers.set(q.id, currentChoices);
      }
    } else {
      // Gestion des réponses simples
      // On peut changer la réponse à tout moment
      this.answers.set(q.id, choice);
    }

    // Soumettre l'attempt à l'API (non bloquant pour l'UI)
    this.submittingAttempt = true;
    this.api
      .createAttempt({
        userId: this.userId,
        questionId: q.id,
        mode: 'exam',
        selectedChoice: choice,
      })
      .subscribe({
        next: () => {
          this.submittingAttempt = false;
        },
        error: (err) => {
          this.error = err?.message ?? String(err);
          this.submittingAttempt = false;
        },
      });
  }

  // Vérifie si un choix est sélectionné pour la question courante
  isChosen(q: Question, choice: string): boolean {
    const answer = this.answers.get(q.id);
    if (!answer) return false;
    
    if (answer instanceof Set) {
      return answer.has(choice);
    }
    return answer === choice;
  }

  // Retourne la réponse sélectionnée pour une question simple
  chosenFor(q: Question): string | null {
    const answer = this.answers.get(q.id);
    if (!answer) return null;
    if (answer instanceof Set) {
      return answer.size > 0 ? Array.from(answer).sort().join(',') : null;
    }
    return answer;
  }

  // Retourne le Set de réponses pour une question multiple
  chosenSetFor(q: Question): Set<string> | null {
    const answer = this.answers.get(q.id);
    if (answer instanceof Set) {
      return answer;
    }
    return null;
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

  // Calcule le score en tenant compte des réponses multiples
  score() {
    let correct = 0;
    for (const q of this.questions) {
      const answer = this.answers.get(q.id);
      if (!answer) continue;

      if (answer instanceof Set) {
        // Pour les questions multi: toutes les réponses doivent être correctes
        const correctAnswers = q.answer.split(',').map(a => a.trim()).sort();
        const selectedAnswers = Array.from(answer).sort();
        
        if (JSON.stringify(correctAnswers) === JSON.stringify(selectedAnswers)) {
          correct += 1;
        }
      } else {
        // Pour les questions simples
        if (answer === q.answer) {
          correct += 1;
        }
      }
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
