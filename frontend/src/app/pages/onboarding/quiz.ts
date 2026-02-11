import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OnboardingService, QuizQuestion } from './onboarding.service';

interface QuestionWithAnswer extends QuizQuestion {
  userAnswer: string | null;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class QuizPage implements OnInit {
  private readonly onboardingService = inject(OnboardingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  chapterId = signal<string>('');
  chapterTitle = signal<string>('');
  questions = signal<QuestionWithAnswer[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  showResults = signal(false);
  score = signal(0);

  // Computed values
  currentQuestionIndex = signal(0);
  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  isLastQuestion = computed(() => this.currentQuestionIndex() >= this.questions().length - 1);
  isFirstQuestion = computed(() => this.currentQuestionIndex() === 0);
  hasAnsweredCurrent = computed(() => this.currentQuestion()?.userAnswer !== null);
  allAnswered = computed(() => this.questions().every((q) => q.userAnswer !== null));

  progressPercentage = computed(() => {
    const answered = this.questions().filter((q) => q.userAnswer !== null).length;
    const total = this.questions().length;
    return total > 0 ? (answered / total) * 100 : 0;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const chapterId = params.get('chapterId');
      if (chapterId) {
        this.chapterId.set(chapterId);
        this.loadQuiz(chapterId);
      } else {
        this.error.set('Quiz non trouvé');
        this.loading.set(false);
      }
    });
  }

  private loadQuiz(chapterId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.onboardingService.getChapterQuiz(chapterId).subscribe({
      next: (response) => {
        const questionsWithAnswers: QuestionWithAnswer[] = response.questions.map((q) => ({
          ...q,
          userAnswer: null,
        }));
        this.questions.set(questionsWithAnswers);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load quiz:', err);
        this.error.set('Impossible de charger le quiz. Veuillez réessayer.');
        this.loading.set(false);
      },
    });

    // Récupérer le titre du chapitre
    this.onboardingService.getChapter(chapterId).subscribe({
      next: (chapter) => {
        this.chapterTitle.set(chapter.title);
      },
      error: () => {
        this.chapterTitle.set('Chapitre');
      },
    });
  }

  selectAnswer(answer: string): void {
    if (this.showResults()) return;

    const questions = [...this.questions()];
    questions[this.currentQuestionIndex()] = {
      ...questions[this.currentQuestionIndex()],
      userAnswer: answer,
    };
    this.questions.set(questions);
  }

  goToNext(): void {
    if (!this.isLastQuestion()) {
      this.currentQuestionIndex.update((i) => i + 1);
    }
  }

  goToPrevious(): void {
    if (!this.isFirstQuestion()) {
      this.currentQuestionIndex.update((i) => i - 1);
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex.set(index);
  }

  submitQuiz(): void {
    if (!this.allAnswered()) return;

    this.submitting.set(true);

    // Calculer le score
    let correct = 0;
    this.questions().forEach((q) => {
      if (q.userAnswer === q.answer) {
        correct++;
      }
    });

    const scorePercentage = Math.round((correct / this.questions().length) * 100);
    this.score.set(scorePercentage);

    // Enregistrer le score
    this.onboardingService
      .markProgress({
        chapterId: this.chapterId(),
        quizScore: scorePercentage,
      })
      .subscribe({
        next: () => {
          this.showResults.set(true);
          this.submitting.set(false);
        },
        error: () => {
          this.showResults.set(true);
          this.submitting.set(false);
        },
      });
  }

  isCorrectAnswer(question: QuestionWithAnswer): boolean {
    return question.userAnswer === question.answer;
  }

  goToChapter(): void {
    this.router.navigate(['/onboarding/chapter', this.chapterId()]);
  }

  goToList(): void {
    this.router.navigate(['/onboarding']);
  }

  retryQuiz(): void {
    this.showResults.set(false);
    this.score.set(0);
    this.currentQuestionIndex.set(0);
    this.questions.update((qs) =>
      qs.map((q) => ({ ...q, userAnswer: null }))
    );
  }

  getChoiceLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  getScoreMessage(): string {
    const s = this.score();
    if (s >= 80) return '🎉 Excellent ! Tu maîtrises ces concepts !';
    if (s >= 60) return '👍 Bien joué ! Continue à réviser.';
    if (s >= 40) return '📚 Pas mal ! Relis le chapitre pour t\'améliorer.';
    return '💪 Continue l\'effort ! Relis le chapitre et réessaie.';
  }

  getScoreColor(): string {
    const s = this.score();
    if (s >= 80) return '#48bb78';
    if (s >= 60) return '#ed8936';
    if (s >= 40) return '#ecc94b';
    return '#fc8181';
  }
}
