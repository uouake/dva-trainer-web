import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlossaryTerm } from '../../core/glossary.service';

@Component({
  selector: 'app-glossary-tooltip-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glossary-popup" [class.visible]="visible" [style.left.px]="x" [style.top.px]="y">
      <div class="popup-header">
        <strong>{{ termData?.term }}</strong>
        <span class="acronym" *ngIf="termData?.acronym">{{ termData?.acronym }}</span>
      </div>
      <div class="popup-content">
        <p class="definition">{{ termData?.definition }}</p>
        <p class="analogy" *ngIf="termData?.analogy">
          <span class="analogy-icon">💡</span>
          {{ termData?.analogy }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      z-index: 10000;
    }
    
    .glossary-popup {
      width: 320px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
      opacity: 0;
      visibility: hidden;
      transform: translateY(8px);
      transition: all 0.2s ease;
    }
    
    .glossary-popup.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    .popup-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: hsl(var(--info) / 0.08);
      border-radius: 12px 12px 0 0;
      border-bottom: 1px solid hsl(var(--border));
    }
    
    .popup-header strong {
      font-size: 14px;
      color: hsl(var(--foreground));
    }
    
    .acronym {
      font-size: 11px;
      color: hsl(var(--muted-foreground));
      background: hsl(var(--muted));
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    .popup-content {
      padding: 12px 16px;
    }
    
    .definition {
      font-size: 13px;
      line-height: 1.5;
      color: hsl(var(--foreground));
      margin: 0 0 10px 0;
    }
    
    .analogy {
      font-size: 12px;
      line-height: 1.4;
      color: hsl(var(--muted-foreground));
      margin: 0;
      padding: 10px;
      background: hsl(var(--accent) / 0.08);
      border-radius: 8px;
      border-left: 3px solid hsl(var(--accent));
    }
    
    .analogy-icon {
      margin-right: 4px;
    }
  `]
})
export class GlossaryTooltipPopupComponent {
  @Input() termData: GlossaryTerm | undefined;
  @Input() x = 0;
  @Input() y = 0;
  @Input() visible = false;
}
