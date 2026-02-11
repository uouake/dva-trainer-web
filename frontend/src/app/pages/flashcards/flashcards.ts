import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FlashcardsService, Flashcard, FlashcardStats } from './flashcards.service';

type FlashcardState = 'loading' | 'empty' | 'study' | 'summary' | 'error';
type FlipState = 'front' | 'back';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './flashcards.html',
  styleUrl: './flashcards.scss',
})
export class FlashcardsPage implements OnInit {
  private readonly flashcardsService = inject(FlashcardsService);

  // State signals
  state = signal<FlashcardState>('loading');
  flashcards = signal<Flashcard[]>([]);
  currentIndex = signal(0);
  flipState = signal<FlipState>('front');
  stats = signal<FlashcardStats | null>(null);
  sessionResults = signal<{ known: number; review: number }>({ known: 0, review: 0 });
  errorMessage = signal<string>('');

  // Computed signals
  currentFlashcard = computed(() => {
    const cards = this.flashcards();
    const index = this.currentIndex();
    return cards[index] || null;
  });

  progressPercentage = computed(() => {
    const total = this.flashcards().length;
    if (total === 0) return 0;
    return ((this.currentIndex() + 1) / total) * 100;
  });

  progressText = computed(() => {
    const current = this.currentIndex() + 1;
    const total = this.flashcards().length;
    return `${current} / ${total}`;
  });

  isLastCard = computed(() => {
    return this.currentIndex() >= this.flashcards().length - 1;
  });

  canFlip = computed(() => {
    return this.state() === 'study' && this.currentFlashcard() !== null;
  });

  ngOnInit(): void {
    this.loadSession();
  }

  private loadSession(): void {
    this.state.set('loading');
    this.errorMessage.set('');

    // Charger les flashcards et les stats en parallèle
    Promise.all([
      this.flashcardsService.getRandomFlashcards(10).toPromise(),
      this.flashcardsService.getStats().toPromise(),
    ])
      .then(([flashcards, stats]) => {
        if (flashcards && flashcards.length > 0) {
          this.flashcards.set(flashcards);
          this.stats.set(stats || null);
          this.currentIndex.set(0);
          this.flipState.set('front');
          this.sessionResults.set({ known: 0, review: 0 });
          this.state.set('study');
        } else {
          this.state.set('empty');
        }
      })
      .catch((err) => {
        console.error('Failed to load flashcards:', err);
        this.errorMessage.set('Impossible de charger les flashcards. Veuillez réessayer.');
        this.state.set('error');
      });
  }

  flipCard(): void {
    if (!this.canFlip()) return;
    this.flipState.update(state => state === 'front' ? 'back' : 'front');
  }

  markAsKnown(): void {
    this.handleAnswer(true);
  }

  markForReview(): void {
    this.handleAnswer(false);
  }

  private handleAnswer(known: boolean): void {
    const currentCard = this.currentFlashcard();
    if (!currentCard) return;

    // Sauvegarder la progression
    this.flashcardsService.saveProgress(currentCard.id, known).subscribe({
      error: (err) => console.error('Failed to save progress:', err),
    });

    // Mettre à jour les résultats de session
    this.sessionResults.update(results => ({
      known: results.known + (known ? 1 : 0),
      review: results.review + (known ? 0 : 1),
    }));

    // Passer à la carte suivante ou afficher le résumé
    if (this.isLastCard()) {
      this.state.set('summary');
    } else {
      this.currentIndex.update(index => index + 1);
      this.flipState.set('front');
    }
  }

  nextCard(): void {
    if (this.isLastCard()) {
      this.state.set('summary');
    } else {
      this.currentIndex.update(index => index + 1);
      this.flipState.set('front');
    }
  }

  previousCard(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(index => index - 1);
      this.flipState.set('front');
    }
  }

  startNewSession(): void {
    this.loadSession();
  }

  retryLoading(): void {
    this.loadSession();
  }

  getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'Facile';
      case 'medium':
        return 'Moyen';
      case 'hard':
        return 'Difficile';
      default:
        return 'Inconnu';
    }
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'easy';
      case 'medium':
        return 'medium';
      case 'hard':
        return 'hard';
      default:
        return '';
    }
  }

  getSuccessRate(): number {
    const results = this.sessionResults();
    const total = results.known + results.review;
    if (total === 0) return 0;
    return Math.round((results.known / total) * 100);
  }
}
