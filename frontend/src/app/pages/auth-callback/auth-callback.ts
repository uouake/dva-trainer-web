import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, AuthUser } from '../../core/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-page">
      <div class="callback-container">
        <div class="spinner"></div>
        <p class="callback-message">Connexion en cours...</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: hsl(var(--background));
    }

    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 3px solid hsl(var(--muted));
      border-top-color: hsl(var(--primary));
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .callback-message {
      font-size: 16px;
      color: hsl(var(--foreground));
      font-weight: 500;
    }
  `]
})
export class AuthCallbackPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      if (error) {
        this.router.navigate(['/login'], { 
          queryParams: { error: 'auth_failed' } 
        });
        return;
      }

      if (token) {
        // Stocker le token
        this.authService.setToken(token);
        
        // Construire l'utilisateur à partir des params
        const user: AuthUser = {
          id: params['id'] || '',
          username: params['username'] || '',
          name: params['name'] || undefined,
          avatarUrl: params['avatarUrl'] || undefined,
          email: params['email'] || undefined
        };
        
        // Sauvegarder l'utilisateur s'il a un username
        if (user.username) {
          this.authService.setUser(user);
        }

        // Rediriger vers le dashboard
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
