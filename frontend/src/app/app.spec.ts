import { describe, it, expect } from 'vitest';
import { App } from './app';

describe('App Component', () => {
  it('should create App class', () => {
    expect(App).toBeDefined();
    
    // Vérifier que c'est un composant standalone
    const componentMeta = (App as any).ɵcmp;
    expect(componentMeta).toBeDefined();
  });

  it('should have correct selector', () => {
    const componentMeta = (App as any).ɵcmp;
    expect(componentMeta.selectors).toEqual([['app-root']]);
  });

  it('should have fullscreen logic', () => {
    const app = new App(null as any);
    expect(app.isFullscreenExam).toBe(false);
    expect(app.sidebarOpen).toBe(false);
  });

  it('should have toggleSidebar method', () => {
    const app = new App(null as any);
    expect(typeof app.toggleSidebar).toBe('function');
    
    app.toggleSidebar();
    expect(app.sidebarOpen).toBe(true);
    
    app.toggleSidebar();
    expect(app.sidebarOpen).toBe(false);
  });

  it('should have closeSidebar method', () => {
    const app = new App(null as any);
    
    app.sidebarOpen = true;
    app.closeSidebar();
    expect(app.sidebarOpen).toBe(false);
  });
});
