import type { AuthUser } from './auth.service';

// Types communs pour l'authentification

export interface RequestWithUser extends Request {
  user: AuthUser;
}
