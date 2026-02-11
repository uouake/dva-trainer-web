import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * AuthGuard
 * 
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.state$.pipe(
      take(1),
      map((state) => {
        if (state.isAuthenticated && state.token) {
          return true;
        }
        // Redirect to login page
        return this.router.createUrlTree(['/login']);
      }),
    );
  }
}

/**
 * Functional auth guard for use with canActivate: [authGuard]
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.state$.pipe(
    take(1),
    map((state) => {
      if (state.isAuthenticated && state.token) {
        return true;
      }
      return router.createUrlTree(['/login']);
    }),
  );
};
