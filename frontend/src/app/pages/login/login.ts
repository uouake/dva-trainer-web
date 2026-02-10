import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginPage {
  private authService = inject(AuthService);

  loginWithGitHub(): void {
    this.authService.loginWithGitHub();
  }
}
