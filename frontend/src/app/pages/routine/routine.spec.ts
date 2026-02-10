import { describe, it, expect } from 'vitest';
import { Routine } from './routine';

describe('Routine Component - Basic Tests', () => {
  it('should create Routine class', () => {
    expect(Routine).toBeDefined();
    
    // Vérifier que c'est un composant standalone
    const componentMeta = (Routine as any).ɵcmp;
    expect(componentMeta).toBeDefined();
  });

  it('should have correct selector', () => {
    const componentMeta = (Routine as any).ɵcmp;
    expect(componentMeta.selectors).toEqual([['app-routine']]);
  });

  it('should have phase property', () => {
    // Vérifier que Routine a les propriétés attendues
    const routine = new Routine(null as any, null as any);
    expect(routine.phase).toBeDefined();
    expect(routine.phase).toBe('intro');
  });

  it('should have startSession method', () => {
    const routine = new Routine(null as any, null as any);
    expect(typeof routine.startSession).toBe('function');
  });

  it('should have backToIntro method', () => {
    const routine = new Routine(null as any, null as any);
    expect(typeof routine.backToIntro).toBe('function');
    
    // Test de la méthode
    routine.phase = 'session';
    routine.backToIntro();
    expect(routine.phase).toBe('intro');
  });

  it('should calculate progress correctly', () => {
    const routine = new Routine(null as any, null as any);
    
    routine.questions = [{}, {}, {}, {}] as any;
    routine.index = 1;
    
    expect(routine.progressPercent()).toBe(50);
  });

  it('should sort choice keys', () => {
    const routine = new Routine(null as any, null as any);
    
    const question = {
      choices: { C: 'C', A: 'A', B: 'B' }
    } as any;
    
    expect(routine.choiceKeys(question)).toEqual(['A', 'B', 'C']);
  });
});

// Tests des routes
describe('Routine Routes', () => {
  it('should be accessible via /routine route', async () => {
    const { routes } = await import('../../app.routes');
    
    const routineRoute = routes.find((r) => r.path === 'routine');
    expect(routineRoute).toBeDefined();
    expect(routineRoute?.component).toBe(Routine);
  });
});
