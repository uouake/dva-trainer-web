import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { AuthUser } from './auth.service';

// JwtAuthGuard
//
// Guard pour protéger les routes avec JWT Bearer token.

export interface RequestWithUser extends Request {
  user: AuthUser;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Non autorisé');
    }
    return user;
  }
}
