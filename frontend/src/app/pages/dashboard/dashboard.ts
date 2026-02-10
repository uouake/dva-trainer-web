import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DvaApi } from '../../api/dva-api';
import { UserIdService } from '../../core/user-id.service';
import { getConceptLabel } from '../../core/concept-labels';

// Dashboard page redesigned to match aws-exam-buddy (layout + cards + quick actions).
//
// For now, stats are placeholders. Once we implement Attempts + Stats API,
// these will be backed by real numbers.

type Stat = {
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning';
};

type DomainProgress = {
  name: string;
  progress: number;
  questions: number;
};

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  loading = true;
  error: string | null = null;

  // MVP preview from API (kept small)
  previewCount = 3;

  stats: Stat[] = [
    { label: 'Questions pratiquées', value: '0', tone: 'primary' },
    { label: 'Taux de réussite', value: '—', tone: 'success' },
    { label: "Temps d'étude", value: '0h', tone: 'warning' },
    { label: 'Série en cours', value: '0 jours', tone: 'primary' },
  ];

  actions = [
    {
      to: '/routine',
      title: 'Routine Quotidienne',
      description:
        'Session rapide de 10–15 questions avec feedback immédiat et explications en français.',
      cta: 'Commencer la session',
      accent: 'primary',
    },
    {
      to: '/exam',
      title: "Simulateur d'Examen",
      description: '65 questions, 130 minutes. Conditions réelles de l\'examen AWS DVA-C02.',
      cta: 'Lancer un examen blanc',
      accent: 'success',
    },
  ] as const;

  domains: DomainProgress[] = [
    { name: 'Développement', progress: 0, questions: 0 },
    { name: 'Sécurité', progress: 0, questions: 0 },
    { name: 'Déploiement', progress: 0, questions: 0 },
    { name: 'Monitoring', progress: 0, questions: 0 },
  ];

  userId = '';
  weakConcepts: Array<{ conceptKey: string; wrongCount: number }> = [];
  domainItems: Array<{ label: string; attempts: number; successRate: number | null }> = [];
  showResetModal = false;

  constructor(
    private readonly api: DvaApi,
    private readonly userIdService: UserIdService,
  ) {
    this.userId = this.userIdService.getOrCreate();
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;

    // Load real stats.
    this.api.dashboardOverview(this.userId).subscribe({
      next: (res) => {
        this.stats = [
          {
            label: 'Questions pratiquées',
            value: String(res.questionsPracticed),
            tone: 'primary',
          },
          {
            label: 'Taux de réussite',
            value: res.successRate === null ? '—' : `${res.successRate}%`,
            tone: 'success',
          },
          // Not tracked yet (V1 later)
          { label: "Temps d'étude", value: '—', tone: 'warning' },
          { label: 'Série en cours', value: '—', tone: 'primary' },
        ];

        this.weakConcepts = res.weakConcepts;

        // Load per-domain breakdown (best-effort).
        this.api.dashboardDomains(this.userId).subscribe({
          next: (domains) => {
            const labelFor = (k: string) =>
              (
                {
                  development: 'Développement',
                  security: 'Security',
                  deployment: 'Deployment',
                  troubleshooting: 'Troubleshooting & Optimization',
                  unknown: 'Unknown',
                } as Record<string, string>
              )[k] ?? k;

            this.domainItems = domains.items
              .map((d) => ({
                label: labelFor(d.domainKey),
                attempts: d.attempts,
                successRate: d.successRate,
              }))
              .sort((a, b) => a.label.localeCompare(b.label));
          },
          error: () => {
            // ignore
          },
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? String(err);
        this.loading = false;
      },
    });
  }

  openResetModal() {
    this.showResetModal = true;
  }

  closeResetModal() {
    this.showResetModal = false;
  }

  confirmResetKpis() {
    this.showResetModal = false;
    this.api.dashboardReset(this.userId).subscribe({
      next: () => {
        this.weakConcepts = [];
        this.domainItems = [];
        this.stats = [
          { label: 'Questions pratiquées', value: '0', tone: 'primary' },
          { label: 'Taux de réussite', value: '—', tone: 'success' },
          { label: "Temps d'étude", value: '—', tone: 'warning' },
          { label: 'Série en cours', value: '—', tone: 'primary' },
        ];
        this.load();
      },
      error: (err) => {
        this.error = err?.message ?? String(err);
      },
    });
  }

  getConceptLabel(conceptKey: string): string {
    return getConceptLabel(conceptKey);
  }
}
