import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DvaApi } from '../../api/dva-api';

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

  constructor(private readonly api: DvaApi) {
    // We only ping the API for health right now.
    // Later, stats will come from /api/dashboard/overview.
    this.api.health().subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message ?? String(err);
        this.loading = false;
      },
    });
  }
}
