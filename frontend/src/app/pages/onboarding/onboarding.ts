import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OnboardingService, Chapter, UserProgress, Season } from './onboarding.service';

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

  // Computed pour les saisons
  seasons = computed<Season[]>(() => {
    const allChapters = this.chapters();
    const seasonMap = new Map<number, Chapter[]>();

    // Grouper les chapitres par saison
    allChapters.forEach(chapter => {
      const seasonNum = chapter.season || 1;
      if (!seasonMap.has(seasonNum)) {
        seasonMap.set(seasonNum, []);
      }
      seasonMap.get(seasonNum)!.push(chapter);
    });

    // Créer les objets Season
    const sortedSeasons = Array.from(seasonMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([number, chapters]) => {
        const completedCount = chapters.filter(c => c.completed).length;
        const progressPercentage = chapters.length > 0
          ? Math.round((completedCount / chapters.length) * 100)
          : 0;

        // Saison verrouillée si ce n'est pas la saison 1 et que la saison précédente n'est pas complète
        let isLocked = false;
        if (number > 1) {
          const previousSeason = seasonMap.get(number - 1);
          if (previousSeason) {
            const prevCompleted = previousSeason.filter(c => c.completed).length;
            isLocked = prevCompleted < previousSeason.length;
          }
        }

        return {
          number,
          title: number === 1 ? 'Saison 1 : Le Festival du Lycée' : 'Saison 2 : L\'Échelle Nationale',
          chapters: chapters.sort((a, b) => a.number - b.number),
          isLocked,
          progressPercentage,
        };
      });

    return sortedSeasons;
  });

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

  getCompletedCount(chapters: Chapter[]): number {
    return chapters.filter(c => c.completed).length;
  }
}
