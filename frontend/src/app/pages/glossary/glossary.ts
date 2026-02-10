import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GlossaryService, GlossaryTerm } from '../../core/glossary.service';

interface GroupedTerms {
  letter: string;
  terms: GlossaryTerm[];
}

@Component({
  selector: 'app-glossary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="glossary-page">
      <header class="glossary-header">
        <h1>📚 Glossaire AWS</h1>
        <p class="subtitle">Comprendre les termes AWS avec des analogies simples</p>
      </header>

      <div class="search-container">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Rechercher un terme (ex: Lambda, S3, IAM...)"
            class="search-input"
          />
          <button *ngIf="searchQuery()" class="clear-btn" (click)="clearSearch()">✕</button>
        </div>
        <span class="results-count" *ngIf="searchQuery()">
          {{ filteredTerms().length }} résultat{{ filteredTerms().length > 1 ? 's' : '' }}
        </span>
      </div>

      <div class="alphabet-filter" *ngIf="!searchQuery()">
        <button
          *ngFor="let letter of alphabet"
          class="letter-btn"
          [class.active]="selectedLetter() === letter"
          [class.has-terms]="hasTermsForLetter(letter)"
          [disabled]="!hasTermsForLetter(letter)"
          (click)="selectLetter(letter)"
        >
          {{ letter }}
        </button>
      </div>

      <div class="terms-container">
        <div *ngIf="filteredTerms().length === 0" class="no-results">
          <span class="no-results-icon">🔍</span>
          <p>Aucun terme trouvé pour "{{ searchQuery() }}"</p>
          <button class="btn-secondary" (click)="clearSearch()">Effacer la recherche</button>
        </div>

        <div *ngIf="!searchQuery() && selectedLetter()" class="letter-section">
          <h2 class="letter-header">{{ selectedLetter() }}</h2>
          <div class="terms-grid">
            <div *ngFor="let term of termsForLetter(selectedLetter())" class="term-card">
              <div class="term-header">
                <h3 class="term-name">{{ term.term }}</h3>
                <span class="term-acronym" *ngIf="term.acronym">{{ term.acronym }}</span>
              </div>
              <p class="term-definition">{{ term.definition }}</p>
              <div class="term-analogy" *ngIf="term.analogy">
                <span class="analogy-icon">💡</span>
                <span class="analogy-text">{{ term.analogy }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="searchQuery()" class="terms-grid">
          <div *ngFor="let term of filteredTerms()" class="term-card highlighted">
            <div class="term-header">
              <h3 class="term-name">{{ term.term }}</h3>
              <span class="term-acronym" *ngIf="term.acronym">{{ term.acronym }}</span>
            </div>
            <p class="term-definition">{{ term.definition }}</p>
            <div class="term-analogy" *ngIf="term.analogy">
              <span class="analogy-icon">💡</span>
              <span class="analogy-text">{{ term.analogy }}</span>
            </div>
          </div>
        </div>

        <div *ngIf="!searchQuery() && !selectedLetter()" class="all-terms">
          <div *ngFor="let group of groupedTerms()" class="letter-section">
            <h2 class="letter-header" [id]="'letter-' + group.letter">{{ group.letter }}</h2>
            <div class="terms-grid">
              <div *ngFor="let term of group.terms" class="term-card">
                <div class="term-header">
                  <h3 class="term-name">{{ term.term }}</h3>
                  <span class="term-acronym" *ngIf="term.acronym">{{ term.acronym }}</span>
                </div>
                <p class="term-definition">{{ term.definition }}</p>
                <div class="term-analogy" *ngIf="term.analogy">
                  <span class="analogy-icon">💡</span>
                  <span class="analogy-text">{{ term.analogy }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="glossary-footer">
        <p>💡 <strong>Astuce :</strong> Dans les questions d'examen, survolez les termes AWS soulignés pour voir leur définition !</p>
        <a routerLink="/dashboard" class="back-link">← Retour au Dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .glossary-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .glossary-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: hsl(var(--foreground));
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 16px;
      color: hsl(var(--muted-foreground));
      margin: 0;
    }

    .search-container {
      margin-bottom: 24px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: 12px;
      padding: 4px;
      transition: all 0.2s ease;
    }

    .search-box:focus-within {
      border-color: hsl(var(--ring));
      box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
    }

    .search-icon {
      font-size: 18px;
      padding: 12px 16px;
      opacity: 0.6;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 16px;
      padding: 12px 8px;
      color: hsl(var(--foreground));
      outline: none;
    }

    .search-input::placeholder {
      color: hsl(var(--muted-foreground));
    }

    .clear-btn {
      background: hsl(var(--muted));
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-right: 8px;
      font-size: 12px;
      color: hsl(var(--muted-foreground));
      transition: all 0.2s ease;
    }

    .clear-btn:hover {
      background: hsl(var(--destructive) / 0.1);
      color: hsl(var(--destructive));
    }

    .results-count {
      display: block;
      text-align: center;
      margin-top: 8px;
      font-size: 14px;
      color: hsl(var(--muted-foreground));
    }

    .alphabet-filter {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
      margin-bottom: 32px;
      padding: 16px;
      background: hsl(var(--muted) / 0.3);
      border-radius: 12px;
    }

    .letter-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      background: transparent;
      font-size: 14px;
      font-weight: 600;
      color: hsl(var(--muted-foreground));
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .letter-btn:hover:not(:disabled) {
      background: hsl(var(--muted));
      color: hsl(var(--foreground));
    }

    .letter-btn.active {
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
    }

    .letter-btn.has-terms {
      color: hsl(var(--foreground));
    }

    .letter-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .terms-container {
      min-height: 400px;
    }

    .letter-section {
      margin-bottom: 40px;
    }

    .letter-header {
      font-size: 28px;
      font-weight: 700;
      color: hsl(var(--primary));
      margin: 0 0 20px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid hsl(var(--border));
    }

    .terms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    @media (max-width: 768px) {
      .terms-grid {
        grid-template-columns: 1fr;
      }
    }

    .term-card {
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s ease;
    }

    .term-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transform: translateY(-2px);
    }

    .term-card.highlighted {
      border-color: hsl(var(--info) / 0.5);
      background: hsl(var(--info) / 0.03);
    }

    .term-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .term-name {
      font-size: 18px;
      font-weight: 600;
      color: hsl(var(--foreground));
      margin: 0;
    }

    .term-acronym {
      font-size: 11px;
      color: hsl(var(--muted-foreground));
      background: hsl(var(--muted));
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 500;
    }

    .term-definition {
      font-size: 14px;
      line-height: 1.6;
      color: hsl(var(--foreground));
      margin: 0 0 14px 0;
    }

    .term-analogy {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px;
      background: hsl(var(--accent) / 0.08);
      border-radius: 8px;
      border-left: 3px solid hsl(var(--accent));
    }

    .analogy-icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .analogy-text {
      font-size: 13px;
      line-height: 1.5;
      color: hsl(var(--muted-foreground));
      font-style: italic;
    }

    .no-results {
      text-align: center;
      padding: 60px 20px;
      color: hsl(var(--muted-foreground));
    }

    .no-results-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-results p {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .btn-secondary {
      background: hsl(var(--secondary));
      color: hsl(var(--secondary-foreground));
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      background: hsl(var(--secondary) / 0.8);
    }

    .glossary-footer {
      margin-top: 48px;
      padding: 24px;
      background: hsl(var(--info) / 0.05);
      border-radius: 12px;
      text-align: center;
      border: 1px solid hsl(var(--info) / 0.2);
    }

    .glossary-footer p {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: hsl(var(--foreground));
    }

    .back-link {
      display: inline-block;
      color: hsl(var(--primary));
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 640px) {
      :host {
        padding: 16px;
      }

      .glossary-header h1 {
        font-size: 24px;
      }

      .alphabet-filter {
        gap: 4px;
      }

      .letter-btn {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }

      .term-card {
        padding: 16px;
      }
    }
  `]
})
export class GlossaryPage {
  searchQuery = signal('');
  selectedLetter = signal<string>('');
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  allTerms = computed(() => this.glossaryService.getAllTerms());

  filteredTerms = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];
    
    return this.allTerms().filter(term =>
      term.term.toLowerCase().includes(query) ||
      term.acronym.toLowerCase().includes(query) ||
      term.definition.toLowerCase().includes(query) ||
      term.analogy.toLowerCase().includes(query)
    );
  });

  groupedTerms = computed(() => {
    const terms = this.allTerms();
    const groups = new Map<string, GlossaryTerm[]>();
    
    for (const term of terms) {
      const firstLetter = term.term.charAt(0).toUpperCase();
      if (!groups.has(firstLetter)) {
        groups.set(firstLetter, []);
      }
      groups.get(firstLetter)!.push(term);
    }

    // Trier chaque groupe par nom de terme
    groups.forEach(groupTerms => {
      groupTerms.sort((a, b) => a.term.localeCompare(b.term));
    });

    return Array.from(groups.entries())
      .map(([letter, terms]) => ({ letter, terms }))
      .sort((a, b) => a.letter.localeCompare(b.letter));
  });

  constructor(private glossaryService: GlossaryService) {}

  hasTermsForLetter(letter: string): boolean {
    return this.allTerms().some(term => 
      term.term.charAt(0).toUpperCase() === letter
    );
  }

  termsForLetter(letter: string): GlossaryTerm[] {
    return this.allTerms()
      .filter(term => term.term.charAt(0).toUpperCase() === letter)
      .sort((a, b) => a.term.localeCompare(b.term));
  }

  selectLetter(letter: string) {
    this.selectedLetter.set(this.selectedLetter() === letter ? '' : letter);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.selectedLetter.set('');
  }
}
