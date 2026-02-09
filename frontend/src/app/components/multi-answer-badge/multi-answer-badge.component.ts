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
      background: linear-gradient(135deg, hsl(var(--warning) / 0.15), hsl(var(--warning) / 0.08));
      color: hsl(var(--warning-foreground));
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      border: 2px solid hsl(var(--warning) / 0.4);
      margin-bottom: 12px;
      animation: pulse-badge 2s infinite;
      box-shadow: 0 2px 8px hsl(var(--warning) / 0.2);
    }
    
    @keyframes pulse-badge {
      0%, 100% {
        box-shadow: 0 2px 8px hsl(var(--warning) / 0.2), 0 0 0 0 hsl(var(--warning) / 0.4);
      }
      50% {
        box-shadow: 0 2px 8px hsl(var(--warning) / 0.2), 0 0 0 6px hsl(var(--warning) / 0);
      }
    }
    
    .badge-icon {
      font-size: 16px;
      animation: bounce 1s infinite;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }
    
    .badge-text {
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    
    @media (max-width: 600px) {
      .multi-answer-badge {
        font-size: 12px;
        padding: 6px 12px;
      }
    }
  `]
})
export class MultiAnswerBadgeComponent {
  @Input() requiredAnswers: number = 1;
}
