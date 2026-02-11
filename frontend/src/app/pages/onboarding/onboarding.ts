import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OnboardingService, Chapter, UserProgress } from './onboarding.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class OnboardingPage implements OnInit {
  private readonly onboardingService = inject(OnboardingService);
  private readonly router = inject(Router);

  // Signals pour l'état
  chapters = signal<Chapter[]>([]);
  progress = signal<UserProgress | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Charger les chapitres et la progression en parallèle
    Promise.all([
      this.onboardingService.listChapters().toPromise(),
      this.onboardingService.getUserProgress().toPromise(),
    ])
      .then(([chapters, progress]) => {
        this.chapters.set(chapters || []);
        this.progress.set(progress || null);
        this.loading.set(false);
      })
      .catch((err) => {
        console.error('Failed to load onboarding data:', err);
        this.error.set('Impossible de charger les chapitres. Veuillez réessayer.');
        this.loading.set(false);
      });
  }

  getChapterIcon(type: string): string {
    switch (type) {
      case 'prologue':
        return '☁️';
      case 'epilogue':
        return '🏗️';
      default:
        return '📖';
    }
  }

  getChapterNumberLabel(chapter: Chapter): string {
    switch (chapter.type) {
      case 'prologue':
        return 'Prologue';
      case 'epilogue':
        return 'Épilogue';
      default:
        return `Chapitre ${chapter.number}`;
    }
  }

  getProgressWidth(): string {
    const percentage = this.progress()?.progressPercentage || 0;
    return `${percentage}%`;
  }

  navigateToChapter(chapterId: string): void {
    this.router.navigate(['/onboarding/chapter', chapterId]);
  }

  navigateToArchitecture(): void {
    this.router.navigate(['/onboarding/architecture']);
  }

  retry(): void {
    this.loadData();
  }
}
