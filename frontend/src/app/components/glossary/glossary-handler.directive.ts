import { Directive, ElementRef, HostListener, Input, ComponentRef, ViewContainerRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { GlossaryService } from '../../core/glossary.service';
import { GlossaryTooltipPopupComponent } from './glossary-tooltip-popup.component';

@Directive({
  selector: '[appGlossaryHandler]',
  standalone: true
})
export class GlossaryHandlerDirective implements OnDestroy {
  @Input() appGlossaryHandler: string = '';
  
  private tooltipRef: ComponentRef<GlossaryTooltipPopupComponent> | null = null;
  
  constructor(
    private el: ElementRef,
    private glossaryService: GlossaryService,
    private viewContainerRef: ViewContainerRef
  ) {
    // Ajouter un écouteur global pour les clics sur les termes du glossaire
    this.el.nativeElement.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('glossary-term-inline')) {
        event.preventDefault();
        event.stopPropagation();
        const term = target.getAttribute('data-term');
        if (term) {
          this.showTooltip(term, event.clientX, event.clientY);
        }
      }
    });
  }
  
  ngOnDestroy() {
    this.hideTooltip();
  }
  
  private showTooltip(term: string, x: number, y: number) {
    // Cacher l'ancien tooltip s'il existe
    this.hideTooltip();
    
    const termData = this.glossaryService.getTerm(term);
    if (!termData) return;
    
    // Créer le composant tooltip dynamiquement
    const componentFactory = this.viewContainerRef.createComponent(GlossaryTooltipPopupComponent);
    this.tooltipRef = componentFactory;
    
    // Configurer le tooltip
    this.tooltipRef.instance.termData = termData;
    this.tooltipRef.instance.x = x;
    this.tooltipRef.instance.y = y + 20;
    this.tooltipRef.instance.visible = true;
    
    // Ajouter au DOM
    document.body.appendChild(this.tooltipRef.location.nativeElement);
    
    // Cacher au clic extérieur
    setTimeout(() => {
      const clickOutsideHandler = (e: MouseEvent) => {
        if (!this.tooltipRef?.location.nativeElement.contains(e.target as Node)) {
          this.hideTooltip();
          document.removeEventListener('click', clickOutsideHandler);
        }
      };
      document.addEventListener('click', clickOutsideHandler);
    }, 0);
  }
  
  private hideTooltip() {
    if (this.tooltipRef) {
      this.tooltipRef.destroy();
      this.tooltipRef = null;
    }
  }
}
