import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OnboardingService, ChapterDetail } from './onboarding.service';

// Fonction simple pour convertir markdown en HTML basique
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code inline
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```/g, '').trim();
      return `<pre><code>${code}</code></pre>`;
    })
    // Line breaks
    .replace(/\n/g, '<br>');
}

@Component({
  selector: 'app-chapter-reader',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chapter-reader.html',
  styleUrl: './chapter-reader.scss',
})
export class ChapterReaderPage implements OnInit {
  private readonly onboardingService = inject(OnboardingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  chapter = signal<ChapterDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  markingAsRead = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const chapterId = params.get('id');
      if (chapterId) {
        this.loadChapter(chapterId);
      } else {
        this.error.set('Chapitre non trouvé');
        this.loading.set(false);
      }
    });
  }

  private loadChapter(chapterId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.onboardingService.getChapter(chapterId).subscribe({
      next: (chapter) => {
        this.chapter.set(chapter);
        this.loading.set(false);
        // Scroll vers le haut
        window.scrollTo(0, 0);
      },
      error: (err) => {
        console.error('Failed to load chapter:', err);
        this.error.set('Impossible de charger le chapitre. Veuillez réessayer.');
        this.loading.set(false);
      },
    });
  }

  getRenderedContent(): string {
    const content = this.chapter()?.content;
    return content ? markdownToHtml(content) : '';
  }

  markAsRead(): void {
    const chapterId = this.chapter()?.id;
    if (!chapterId) return;

    this.markingAsRead.set(true);

    this.onboardingService.markProgress({ chapterId }).subscribe({
      next: () => {
        // Mettre à jour le chapitre localement
        const current = this.chapter();
        if (current) {
          this.chapter.set({ ...current, completed: true });
        }
        this.markingAsRead.set(false);
      },
      error: (err) => {
        console.error('Failed to mark as read:', err);
        this.markingAsRead.set(false);
      },
    });
  }

  goToQuiz(): void {
    const chapterId = this.chapter()?.id;
    if (chapterId) {
      this.router.navigate(['/onboarding/quiz', chapterId]);
    }
  }

  goToPrevious(): void {
    const previous = this.chapter()?.previous;
    if (previous) {
      this.router.navigate(['/onboarding/chapter', previous.id]);
    }
  }

  goToNext(): void {
    const next = this.chapter()?.next;
    if (next) {
      this.router.navigate(['/onboarding/chapter', next.id]);
    }
  }

  goToList(): void {
    this.router.navigate(['/onboarding']);
  }

  getChapterNumberLabel(): string {
    const type = this.chapter()?.type;
    const number = this.chapter()?.number;

    switch (type) {
      case 'prologue':
        return 'Prologue';
      case 'epilogue':
        return 'Épilogue';
      default:
        return `Chapitre ${number}`;
    }
  }
}
