import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light' | 'auto';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'dva-theme-mode';
  
  // Signal to track current theme mode
  readonly themeMode = signal<ThemeMode>(this.loadThemeMode());
  
  // Computed signal for effective theme (resolved auto to actual dark/light)
  readonly effectiveTheme = signal<'dark' | 'light'>('light');

  constructor() {
    // Initialize theme on creation
    this.applyTheme();
    
    // Watch for system preference changes
    this.watchSystemPreference();
    
    // Apply theme whenever mode changes
    effect(() => {
      const mode = this.themeMode();
      this.saveThemeMode(mode);
      this.updateEffectiveTheme();
    });
  }

  /**
   * Set the theme mode (dark, light, or auto)
   */
  setTheme(mode: ThemeMode): void {
    this.themeMode.set(mode);
  }

  /**
   * Toggle between dark and light (skips auto for quick toggle)
   */
  toggleTheme(): void {
    const current = this.effectiveTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  /**
   * Get the current effective theme (dark or light)
   */
  getEffectiveTheme(): 'dark' | 'light' {
    return this.effectiveTheme();
  }

  /**
   * Check if dark mode is currently active
   */
  isDark(): boolean {
    return this.effectiveTheme() === 'dark';
  }

  private loadThemeMode(): ThemeMode {
    if (typeof window === 'undefined') return 'auto';
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'auto') {
      return stored;
    }
    return 'auto';
  }

  private saveThemeMode(mode: ThemeMode): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

  private updateEffectiveTheme(): void {
    const mode = this.themeMode();
    let effective: 'dark' | 'light';

    if (mode === 'auto') {
      effective = this.getSystemPreference();
    } else {
      effective = mode;
    }

    this.effectiveTheme.set(effective);
    this.applyThemeToDOM(effective);
  }

  private applyTheme(): void {
    this.updateEffectiveTheme();
  }

  private getSystemPreference(): 'dark' | 'light' {
    if (typeof window === 'undefined') return 'light';
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }

  private watchSystemPreference(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Use the appropriate event listener API
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (this.themeMode() === 'auto') {
        const newTheme = e.matches ? 'dark' : 'light';
        this.effectiveTheme.set(newTheme);
        this.applyThemeToDOM(newTheme);
      }
    };

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }
  }

  private applyThemeToDOM(theme: 'dark' | 'light'): void {
    if (typeof document === 'undefined') return;
    
    const html = document.documentElement;
    
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
  }
}
