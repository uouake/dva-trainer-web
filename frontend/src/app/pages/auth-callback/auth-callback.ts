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
        <!-- Debug info visible -->
        <div *ngIf="debugInfo" style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.1); border-radius: 8px; font-size: 12px; max-width: 300px; word-break: break-all;">
          <div><strong>Token:</strong> {{ debugInfo.hasToken ? 'Oui' : 'Non' }}</div>
          <div><strong>Username:</strong> {{ debugInfo.username || 'Non' }}</div>
          <div><strong>Name:</strong> {{ debugInfo.name || 'Non' }}</div>
          <div><strong>ID:</strong> {{ debugInfo.id || 'Non' }}</div>
        </div>
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
  
  debugInfo: { hasToken: boolean; username?: string; name?: string; id?: string } | null = null;

  ngOnInit(): void {
    // Récupérer le token depuis les query params
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      console.log('[Auth Callback] Params received:', Object.keys(params));

      if (error) {
        console.error('Erreur d\'authentification:', error);
        this.router.navigate(['/login'], { 
          queryParams: { error: 'auth_failed' } 
        });
        return;
      }

      if (token) {
        // Afficher les debug info à l'écran
        this.debugInfo = {
          hasToken: true,
          username: params['username'] || 'MANQUANT',
          name: params['name'] || 'MANQUANT',
          id: params['id'] || 'MANQUANT'
        };
        
        console.log('[Auth Callback] Token received:', token.substring(0, 20) + '...');
        
        // Attendre 3 secondes pour que l'utilisateur puisse voir les infos
        setTimeout(() => {
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
          
          console.log('[Auth Callback] User data:', JSON.stringify(user));
          
          // Toujours sauvegarder l'utilisateur s'il a un username
          if (user.username) {
            this.authService.setUser(user);
            console.log('[Auth Callback] User saved successfully');
          } else {
            console.warn('[Auth Callback] No username in params!');
          }

          // Rediriger vers le dashboard
          this.router.navigate(['/dashboard']);
        }, 3000);
      } else {
        this.debugInfo = { hasToken: false };
        console.error('[Auth Callback] No token received!');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
  }
}
