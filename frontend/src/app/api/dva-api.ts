import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

// Thin API client for our NestJS backend.
//
// Keeping all HTTP calls in one place makes it easier to:
// - refactor endpoints
// - add auth later
// - mock calls in tests

export type Question = {
  id: string;
  exam: string;
  topic: number;
  questionNumber: number;
  stem: string;
  choices: Record<string, string>;
  answer: string;
  conceptKey: string;
  frExplanation: string;
  sourceUrl: string;
  textHash: string;
};

export type Paged<T> = {
  total: number;
  limit: number;
  offset: number;
  items: T[];
};

@Injectable({
  providedIn: 'root',
})
export class DvaApi {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  health() {
    return this.http.get<{ ok: boolean }>(`${this.base}/api/health`);
  }

  listQuestions(limit = 20, offset = 0) {
    const params = new HttpParams().set('limit', limit).set('offset', offset);
    return this.http.get<Paged<Question>>(`${this.base}/api/questions`, {
      params,
    });
  }

  startDailySession(limit = 10) {
    return this.http.post<{ mode: 'daily'; limit: number; items: Question[] }>(
      `${this.base}/api/daily-session/start`,
      { limit },
    );
  }

  startExam() {
    return this.http.post<{
      mode: 'exam';
      count: number;
      durationMinutes: number;
      items: Question[];
    }>(`${this.base}/api/exams/start`, {});
  }
}
