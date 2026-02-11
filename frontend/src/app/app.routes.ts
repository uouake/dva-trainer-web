import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Routine } from './pages/routine/routine';
import { Exam } from './pages/exam/exam';
import { GlossaryPage } from './pages/glossary/glossary';
import { LoginPage } from './pages/login/login';
import { AuthCallbackPage } from './pages/auth-callback/auth-callback';
import { 
  OnboardingPage, 
  ChapterReaderPage, 
  QuizPage, 
  ArchitecturePage 
} from './pages/onboarding';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: Dashboard },
  { path: 'routine', component: Routine },
  { path: 'exam', component: Exam },
  { path: 'glossary', component: GlossaryPage },
  { path: 'login', component: LoginPage },
  { path: 'auth/callback', component: AuthCallbackPage },
  
  // Routes onboarding (protégées par authGuard)
  { path: 'onboarding', component: OnboardingPage, canActivate: [authGuard] },
  { path: 'onboarding/chapter/:id', component: ChapterReaderPage, canActivate: [authGuard] },
  { path: 'onboarding/quiz/:chapterId', component: QuizPage, canActivate: [authGuard] },
  { path: 'onboarding/architecture', component: ArchitecturePage, canActivate: [authGuard] },
];
