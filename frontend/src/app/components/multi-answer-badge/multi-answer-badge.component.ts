import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multi-answer-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="multi-answer-badge" *ngIf="requiredAnswers > 1">
      <span class="badge-icon">🎯</span>
      <span class="badge-text">{{ requiredAnswers }} réponses nécessaires</span>
    </div>
  `,
  styles: [`
    .multi-answer-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: hsl(var(--warning) / 0.12);
      color: hsl(var(--warning-foreground));
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid hsl(var(--warning) / 0.3);
      margin-bottom: 12px;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 hsl(var(--warning) / 0.4);
      }
      50% {
        box-shadow: 0 0 0 4px hsl(var(--warning) / 0);
      }
    }
    
    .badge-icon {
      font-size: 14px;
    }
    
    .badge-text {
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
  `]
})
export class MultiAnswerBadgeComponent {
  @Input() requiredAnswers: number = 1;
}
