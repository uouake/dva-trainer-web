import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FlashcardsService, Flashcard } from './flashcards.service';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './flashcards.html',
  styleUrl: './flashcards.scss',
})
export class FlashcardsPage implements OnInit {
  private readonly flashcardsService = inject(FlashcardsService);

  // Signals pour l'état
  flashcards = signal<Flashcard[]>([]);
  currentIndex = signal(0);
  isFlipped = signal(false);
  loading = signal(true);
  error = signal<string | null>(null);
  sessionComplete = signal(false);
  progress = signal({ known: 0, review: 0, total: 0 });

  ngOnInit(): void {
    this.loadFlashcards();
  }

  private loadFlashcards(): void {
    this.loading.set(true);
    this.error.set(null);

    this.flashcardsService.getRandomFlashcards(10).subscribe({
      next: (cards) => {
        this.flashcards.set(cards);
        this.progress.update(p => ({ ...p, total: cards.length }));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load flashcards:', err);
        this.error.set('Impossible de charger les flashcards. Veuillez réessayer.');
        this.loading.set(false);
      },
    });
  }

  get currentCard(): Flashcard | null {
    return this.flashcards()[this.currentIndex()] || null;
  }

  flipCard(): void {
    this.isFlipped.update(f => !f);
  }

  nextCard(): void {
    if (this.currentIndex() < this.flashcards().length - 1) {
      this.isFlipped.set(false);
      setTimeout(() => {
        this.currentIndex.update(i => i + 1);
      }, 150);
    } else {
      this.sessionComplete.set(true);
    }
  }

  markAsKnown(): void {
    const card = this.currentCard;
    if (card) {
      this.flashcardsService.saveProgress(card.id, true).subscribe();
      this.progress.update(p => ({ ...p, known: p.known + 1 }));
    }
    this.nextCard();
  }

  markForReview(): void {
    const card = this.currentCard;
    if (card) {
      this.flashcardsService.saveProgress(card.id, false).subscribe();
      this.progress.update(p => ({ ...p, review: p.review + 1 }));
    }
    this.nextCard();
  }

  restartSession(): void {
    this.currentIndex.set(0);
    this.isFlipped.set(false);
    this.sessionComplete.set(false);
    this.progress.set({ known: 0, review: 0, total: this.flashcards().length });
    this.loadFlashcards();
  }

  getProgressWidth(): string {
    const total = this.progress().total;
    if (total === 0) return '0%';
    const current = this.currentIndex() + (this.sessionComplete() ? 1 : 0);
    return `${(current / total) * 100}%`;
  }
}
