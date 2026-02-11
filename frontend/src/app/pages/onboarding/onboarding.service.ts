import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Chapter {
  id: string;
  number: number;
  title: string;
  type: string;
  season: number;
  completed: boolean;
  quizScore: number | null;
}

export interface Season {
  number: number;
  title: string;
  chapters: Chapter[];
  isLocked: boolean;
  progressPercentage: number;
}

export interface ChapterDetail extends Chapter {
  content: string;
  conceptKeys: string[];
  previous: Chapter | null;
  next: Chapter | null;
}

export interface UserProgress {
  totalChapters: number;
  completedChapters: number;
  progressPercentage: number;
  chapters: Chapter[];
}

export interface QuizQuestion {
  id: string;
  stem: string;
  choices: Record<string, string>;
  answer: string;
  requiredAnswers: number;
  conceptKey: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

export interface MarkProgressRequest {
  chapterId: string;
  quizScore?: number;
}

export interface MarkProgressResponse {
  success: boolean;
  chapterId: string;
  completedAt: Date;
  quizScore: number | null;
}

/**
 * OnboardingService
 *
 * Service pour gérer l'histoire manga AWS (onboarding).
 * Interagit avec l'API backend.
 */
@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  /**
   * Liste tous les chapitres
   */
  listChapters(): Observable<Chapter[]> {
    return this.http.get<Chapter[]>(`${this.apiUrl}/api/onboarding/chapters`);
  }

  /**
   * Récupère le détail d'un chapitre
   */
  getChapter(chapterId: string): Observable<ChapterDetail> {
    return this.http.get<ChapterDetail>(`${this.apiUrl}/api/onboarding/chapters/${chapterId}`);
  }

  /**
   * Récupère le quiz d'un chapitre
   */
  getChapterQuiz(chapterId: string): Observable<QuizResponse> {
    return this.http.get<QuizResponse>(`${this.apiUrl}/api/onboarding/chapters/${chapterId}/quiz`);
  }

  /**
   * Marque un chapitre comme lu
   */
  markProgress(request: MarkProgressRequest): Observable<MarkProgressResponse> {
    return this.http.post<MarkProgressResponse>(`${this.apiUrl}/api/onboarding/progress`, request);
  }

  /**
   * Récupère la progression de l'utilisateur
   */
  getUserProgress(): Observable<UserProgress> {
    return this.http.get<UserProgress>(`${this.apiUrl}/api/onboarding/progress`);
  }

  /**
   * Récupère les saisons avec leurs chapitres groupés
   */
  getSeasons(): Observable<Season[]> {
    return this.http.get<Season[]>(`${this.apiUrl}/api/onboarding/seasons`);
  }

  /**
   * Récupère la saison actuelle de l'utilisateur
   * (la première saison non complétée ou la dernière si tout est complété)
   */
  getCurrentSeason(): Observable<{ season: number; isCompleted: boolean }> {
    return this.http.get<{ season: number; isCompleted: boolean }>(`${this.apiUrl}/api/onboarding/current-season`);
  }
}
