import { Component, Input, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlossaryService, GlossaryTerm } from '../core/glossary.service';

@Component({
  selector: 'app-glossary-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      #trigger
      class="glossary-term"
      [class.has-tooltip]="termData"
      (mouseenter)="showTooltip()"
      (mouseleave)="hideTooltip()"
      (click)="toggleTooltip($event)"
    >
      {{ displayTerm }}
      <span 
        #tooltip
        class="glossary-tooltip"
        [class.visible]="isVisible"
        [style.left.px]="tooltipX"
        [style.top.px]="tooltipY"
      >
        <div class="tooltip-header">
          <strong>{{ termData?.term }}</strong>
          <span class="acronym" *ngIf="termData?.acronym">{{ termData?.acronym }}</span>
        </div>
        <div class="tooltip-content">
          <p class="definition">{{ termData?.definition }}</p>
          <p class="analogy" *ngIf="termData?.analogy">
            <span class="analogy-icon">💡</span>
            {{ termData?.analogy }}
          </p>
        </div>
      </span>
    </span>
  `,
  styles: [`
    :host {
      display: inline;
    }
    
    .glossary-term {
      position: relative;
      cursor: help;
      border-bottom: 1px dashed hsl(var(--info) / 0.5);
      color: hsl(var(--info));
      transition: all 0.2s ease;
    }
    
    .glossary-term:hover {
      background: hsl(var(--info) / 0.1);
      border-bottom-style: solid;
    }
    
    .glossary-term.has-tooltip {
      font-weight: 500;
    }
    
    .glossary-tooltip {
      position: fixed;
      z-index: 1000;
      width: 320px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
      padding: 0;
      opacity: 0;
      visibility: hidden;
      transform: translateY(8px);
      transition: all 0.2s ease;
      pointer-events: none;
    }
    
    .glossary-tooltip.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    .tooltip-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: hsl(var(--info) / 0.08);
      border-radius: 12px 12px 0 0;
      border-bottom: 1px solid hsl(var(--border));
    }
    
    .tooltip-header strong {
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
    
    .tooltip-content {
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
    
    @media (max-width: 600px) {
      .glossary-tooltip {
        width: 280px;
        left: 50% !important;
        transform: translateX(-50%) translateY(8px);
      }
      
      .glossary-tooltip.visible {
        transform: translateX(-50%) translateY(0);
      }
    }
  `]
})
export class GlossaryTooltipComponent implements OnInit, OnDestroy {
  @Input() term: string = '';
  @Input() displayText: string = '';
  
  @ViewChild('trigger') triggerRef!: ElementRef;
  @ViewChild('tooltip') tooltipRef!: ElementRef;
  
  termData: GlossaryTerm | undefined;
  isVisible = false;
  tooltipX = 0;
  tooltipY = 0;
  
  private hideTimeout: any;
  
  constructor(private glossaryService: GlossaryService) {}
  
  ngOnInit() {
    this.termData = this.glossaryService.getTerm(this.term);
  }
  
  ngOnDestroy() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }
  
  get displayTerm(): string {
    return this.displayText || this.term;
  }
  
  showTooltip() {
    if (!this.termData) return;
    
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    this.calculatePosition();
    this.isVisible = true;
  }
  
  hideTooltip() {
    this.hideTimeout = setTimeout(() => {
      this.isVisible = false;
    }, 200);
  }
  
  toggleTooltip(event: Event) {
    event.stopPropagation();
    if (this.isVisible) {
      this.isVisible = false;
    } else {
      this.showTooltip();
    }
  }
  
  private calculatePosition() {
    const trigger = this.triggerRef.nativeElement;
    const rect = trigger.getBoundingClientRect();
    
    // Position par défaut : en dessous du terme
    let x = rect.left;
    let y = rect.bottom + 8;
    
    // Ajuster si ça dépasse de l'écran
    const tooltipWidth = 320;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (x + tooltipWidth > windowWidth - 16) {
      x = windowWidth - tooltipWidth - 16;
    }
    
    if (x < 16) {
      x = 16;
    }
    
    // Si pas assez de place en dessous, mettre au-dessus
    const tooltipHeight = 150; // estimation
    if (y + tooltipHeight > windowHeight - 16) {
      y = rect.top - tooltipHeight - 8;
    }
    
    this.tooltipX = x;
    this.tooltipY = y;
  }
}
