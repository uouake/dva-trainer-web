import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface FlashcardProgress {
  flashcardId: string;
  known: boolean;
  reviewedAt: Date;
  timesReviewed: number;
}

export interface FlashcardStats {
  totalFlashcards: number;
  reviewedFlashcards: number;
  knownFlashcards: number;
  toReviewFlashcards: number;
  progressPercentage: number;
  streakDays: number;
  lastStudyDate: Date | null;
}

/**
 * FlashcardsService
 *
 * Service pour gérer les flashcards d'entraînement AWS.
 * Permet de réviser les concepts clés sous forme de cartes mémoire.
 */
@Injectable({
  providedIn: 'root',
})
export class FlashcardsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  /**
   * Récupère toutes les flashcards disponibles
   */
  getFlashcards(): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(`${this.apiUrl}/api/flashcards`);
  }

  /**
   * Récupère un nombre aléatoire de flashcards pour l'entraînement
   */
  getRandomFlashcards(count: number): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(`${this.apiUrl}/api/flashcards/random?count=${count}`);
  }

  /**
   * Sauvegarde la progression sur une flashcard
   */
  saveProgress(flashcardId: string, known: boolean): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/flashcards/progress`, {
      flashcardId,
      known,
    });
  }

  /**
   * Récupère les statistiques de l'utilisateur sur les flashcards
   */
  getStats(): Observable<FlashcardStats> {
    return this.http.get<FlashcardStats>(`${this.apiUrl}/api/flashcards/stats`);
  }

  /**
   * Récupère les flashcards à réviser (celles marquées comme non connues)
   */
  getFlashcardsToReview(): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(`${this.apiUrl}/api/flashcards/to-review`);
  }

  /**
   * Réinitialise la progression des flashcards
   */
  resetProgress(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/flashcards/reset`, {});
  }
}
