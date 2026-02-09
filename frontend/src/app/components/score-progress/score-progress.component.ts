import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="score-progress">
      <div class="score-header">
        <span class="score-label">Progression</span>
        <span class="score-value">{{ currentScore }}/{{ targetScore }} routines réussies</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" [style.width.%]="progressPercent"></div>
        <div class="milestone-markers">
          <div 
            *ngFor="let m of milestones" 
            class="milestone"
            [class.reached]="currentScore >= m"
            [style.left.%]="(m / targetScore) * 100"
          >
            <span class="milestone-number">{{ m }}</span>
          </div>
        </div>
      </div>
      <div class="score-message" *ngIf="message">
        {{ message }}
      </div>
    </div>
  `,
  styles: [`
    .score-progress {
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }
    
    .score-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .score-label {
      font-weight: 600;
      font-size: 14px;
      color: hsl(var(--foreground));
    }
    
    .score-value {
      font-size: 13px;
      color: hsl(var(--muted-foreground));
    }
    
    .progress-track {
      position: relative;
      height: 8px;
      background: hsl(var(--muted));
      border-radius: 4px;
      overflow: visible;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, hsl(var(--info)), hsl(var(--success)));
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    
    .milestone-markers {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }
    
    .milestone {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      background: white;
      border: 2px solid hsl(var(--muted));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    .milestone.reached {
      background: hsl(var(--success));
      border-color: hsl(var(--success));
    }
    
    .milestone-number {
      font-size: 9px;
      font-weight: 700;
      color: hsl(var(--muted-foreground));
    }
    
    .milestone.reached .milestone-number {
      color: white;
    }
    
    .score-message {
      margin-top: 12px;
      padding: 10px 12px;
      background: hsl(var(--success) / 0.1);
      border-radius: 8px;
      font-size: 13px;
      color: hsl(var(--success));
      text-align: center;
    }
  `]
})
export class ScoreProgressComponent {
  @Input() currentScore: number = 0;
  @Input() targetScore: number = 10;
  @Input() message: string = '';
  
  get progressPercent(): number {
    return Math.min((this.currentScore / this.targetScore) * 100, 100);
  }
  
  get milestones(): number[] {
    const step = Math.ceil(this.targetScore / 5);
    const result: number[] = [];
    for (let i = step; i < this.targetScore; i += step) {
      result.push(i);
    }
    result.push(this.targetScore);
    return result;
  }
}
