import { describe, it, expect } from 'vitest';
import { Dashboard } from './dashboard';
import { DvaApi } from '../../api/dva-api';
import { UserIdService } from '../../core/user-id.service';

describe('Dashboard Component - Basic Tests', () => {
  it('should create Dashboard class', () => {
    // Test simple que la classe existe et a les bonnes propriétés
    expect(Dashboard).toBeDefined();
    
    // Vérifier que c'est un composant standalone
    const componentMeta = (Dashboard as any).ɵcmp;
    expect(componentMeta).toBeDefined();
  });

  it('should have required properties', () => {
    // Vérifier que les propriétés essentielles existent sur le prototype
    const proto = Dashboard.prototype;
    
    expect(Object.prototype.hasOwnProperty.call(proto, 'loading')).toBe(false); // instance property
    expect(Object.prototype.hasOwnProperty.call(proto, 'load')).toBe(true); // method
  });

  it('should have correct selector', () => {
    const componentMeta = (Dashboard as any).ɵcmp;
    expect(componentMeta.selectors).toEqual([['app-dashboard']]);
  });
});

// Tests des routes
describe('Dashboard Routes', () => {
  it('should be accessible via /dashboard route', async () => {
    // Importer les routes dynamiquement
    const { routes } = await import('../../app.routes');
    
    const dashboardRoute = routes.find((r) => r.path === 'dashboard');
    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute?.component).toBe(Dashboard);
  });
});
