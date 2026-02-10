import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Routine } from './pages/routine/routine';
import { Exam } from './pages/exam/exam';
import { GlossaryPage } from './pages/glossary/glossary';
import { LoginPage } from './pages/login/login';
import { AuthCallbackPage } from './pages/auth-callback/auth-callback';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: Dashboard },
  { path: 'routine', component: Routine },
  { path: 'exam', component: Exam },
  { path: 'glossary', component: GlossaryPage },
  { path: 'login', component: LoginPage },
  { path: 'auth/callback', component: AuthCallbackPage },
];
