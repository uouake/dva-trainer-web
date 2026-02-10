import { Component, inject, signal } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ThemeService, ThemeMode } from './core/theme.service';

@Component({
  selector: 'app-root',
  // Because this is a standalone component, we must explicitly import
  // all router directives we use in the template (routerLink, routerLinkActive, router-outlet).
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('frontend');
  protected readonly themeService = inject(ThemeService);

  // When the user is in the exam runner, we want a true fullscreen experience.
  // That means: no sidebar, no outer padding.
  isFullscreenExam = false;

  // Mobile sidebar state
  sidebarOpen = false;

  // Theme options for the toggle
  readonly themeOptions: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'dark', label: 'Dark', icon: '🌙' },
    { mode: 'light', label: 'Light', icon: '☀️' },
    { mode: 'auto', label: 'Auto', icon: '🔄' },
  ];

  constructor(private readonly router: Router) {
    this.updateFullscreen(router.url);
    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.updateFullscreen(e.urlAfterRedirects);
      }
    });
  }

  private updateFullscreen(url: string) {
    // Fullscreen for the whole /exam route.
    // If later we want only in-progress exam to be fullscreen, we can refine this.
    this.isFullscreenExam = url.startsWith('/exam');
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
  }
}
