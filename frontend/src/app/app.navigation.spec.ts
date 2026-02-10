import { describe, it, expect } from 'vitest';
import { routes } from './app.routes';
import { Dashboard } from './pages/dashboard/dashboard';
import { Routine } from './pages/routine/routine';
import { Exam } from './pages/exam/exam';

describe('App Routes', () => {
  it('should have dashboard route', () => {
    const dashboardRoute = routes.find((r) => r.path === 'dashboard');
    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute?.component).toBe(Dashboard);
  });

  it('should have routine route', () => {
    const routineRoute = routes.find((r) => r.path === 'routine');
    expect(routineRoute).toBeDefined();
    expect(routineRoute?.component).toBe(Routine);
  });

  it('should have exam route', () => {
    const examRoute = routes.find((r) => r.path === 'exam');
    expect(examRoute).toBeDefined();
    expect(examRoute?.component).toBe(Exam);
  });

  it('should redirect empty path to dashboard', () => {
    const emptyRoute = routes.find((r) => r.path === '' && r.pathMatch === 'full');
    expect(emptyRoute).toBeDefined();
    expect(emptyRoute?.redirectTo).toBe('dashboard');
  });

  it('should have exactly 4 routes', () => {
    expect(routes.length).toBe(4);
  });
});
