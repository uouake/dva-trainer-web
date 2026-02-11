import { describe, it, expect } from 'vitest';
import { FlashcardsPage } from './flashcards';
import { FlashcardsService } from './flashcards.service';

describe('FlashcardsPage Component - Basic Tests', () => {
  it('should create FlashcardsPage class', () => {
    // Test simple que la classe existe et a les bonnes propriétés
    expect(FlashcardsPage).toBeDefined();

    // Vérifier que c'est un composant standalone
    const componentMeta = (FlashcardsPage as any).ɵcmp;
    expect(componentMeta).toBeDefined();
  });

  it('should have correct selector', () => {
    const componentMeta = (FlashcardsPage as any).ɵcmp;
    expect(componentMeta.selectors).toEqual([['app-flashcards']]);
  });

  it('should have required methods', () => {
    // Vérifier que les méthodes essentielles existent sur le prototype
    const proto = FlashcardsPage.prototype;

    expect(Object.prototype.hasOwnProperty.call(proto, 'flipCard')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'markAsKnown')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'markForReview')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'nextCard')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'previousCard')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'startNewSession')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'getDifficultyLabel')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'getDifficultyColor')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'getSuccessRate')).toBe(true);
  });

  it('should have correct template and style URLs', () => {
    const componentMeta = (FlashcardsPage as any).ɵcmp;
    expect(componentMeta.templateUrl).toBe('./flashcards.html');
    expect(componentMeta.styleUrl).toBe('./flashcards.scss');
  });
});

// Tests des helpers
describe('FlashcardsPage Helpers', () => {
  it('should return correct difficulty labels', () => {
    const proto = FlashcardsPage.prototype;

    // Créer une instance mock pour tester les méthodes
    const mockComponent = Object.create(proto);

    expect(mockComponent.getDifficultyLabel('easy')).toBe('Facile');
    expect(mockComponent.getDifficultyLabel('medium')).toBe('Moyen');
    expect(mockComponent.getDifficultyLabel('hard')).toBe('Difficile');
    expect(mockComponent.getDifficultyLabel('unknown')).toBe('Inconnu');
  });

  it('should return correct difficulty colors', () => {
    const proto = FlashcardsPage.prototype;
    const mockComponent = Object.create(proto);

    expect(mockComponent.getDifficultyColor('easy')).toBe('easy');
    expect(mockComponent.getDifficultyColor('medium')).toBe('medium');
    expect(mockComponent.getDifficultyColor('hard')).toBe('hard');
    expect(mockComponent.getDifficultyColor('unknown')).toBe('');
  });

  it('should calculate success rate correctly', () => {
    const proto = FlashcardsPage.prototype;
    const mockComponent = Object.create(proto);

    // Simuler les résultats de session
    mockComponent.sessionResults = { known: 8, review: 2 };
    expect(mockComponent.getSuccessRate()).toBe(80);

    mockComponent.sessionResults = { known: 5, review: 5 };
    expect(mockComponent.getSuccessRate()).toBe(50);

    mockComponent.sessionResults = { known: 0, review: 0 };
    expect(mockComponent.getSuccessRate()).toBe(0);
  });
});

// Tests des routes
describe('Flashcards Routes', () => {
  it('should be accessible via /flashcards route', async () => {
    // Importer les routes dynamiquement
    const { routes } = await import('../../app.routes');

    const flashcardsRoute = routes.find((r) => r.path === 'flashcards');
    expect(flashcardsRoute).toBeDefined();
    expect(flashcardsRoute?.component).toBe(FlashcardsPage);
    expect(flashcardsRoute?.canActivate).toBeDefined();
  });
});

// Tests du service
describe('FlashcardsService', () => {
  it('should be defined', () => {
    expect(FlashcardsService).toBeDefined();
  });

  it('should have required methods', () => {
    const proto = FlashcardsService.prototype;

    expect(Object.prototype.hasOwnProperty.call(proto, 'getFlashcards')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'getRandomFlashcards')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'saveProgress')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'getStats')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'getFlashcardsToReview')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(proto, 'resetProgress')).toBe(true);
  });
});
