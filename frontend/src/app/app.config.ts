import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Ensures Angular runs change detection after async events.
    // Without this, you can end up with data loaded but UI not updating.
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // Needed for calling the NestJS backend.
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
  ],
};
