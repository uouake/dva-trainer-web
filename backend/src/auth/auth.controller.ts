import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { RequestWithUser } from './auth.types';

// AuthController
//
// Endpoints d'authentification OAuth GitHub.

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // GET /api/auth/github
  // Redirige vers GitHub OAuth
  @Get('github')
  githubAuth(@Res() res: Response) {
    const authUrl = this.authService.getGitHubAuthUrl();
    return res.redirect(authUrl);
  }

  // GET /api/auth/github/callback
  // Callback OAuth - création user et retour JWT
  @Get('github/callback')
  async githubAuthCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    if (!code) {
      return res.status(400).json({ error: 'Code manquant' });
    }

    const { token, user } = await this.authService.handleGitHubCallback(code);
    
    // Redirection vers le frontend avec le token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  // GET /api/auth/me
  // Info utilisateur connecté
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: RequestWithUser) {
    return req.user;
  }

  // POST /api/auth/logout
  // Déconnexion (côté client principalement, mais endpoint pour cohérence)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    // Le JWT est stateless, la déconnexion se fait côté client
    // en supprimant le token du stockage
    return { message: 'Déconnexion réussie' };
  }
}
