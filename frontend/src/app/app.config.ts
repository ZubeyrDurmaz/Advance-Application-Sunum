import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

/**
 * Application configuration
 * 
 * Interceptor Order:
 * 1. LoadingInterceptor - Tracks request lifecycle for loading state
 * 2. AuthInterceptor - Injects JWT tokens and handles token refresh
 * 3. ErrorInterceptor - Handles error responses and transforms to user-friendly messages
 * 
 * Requirements: 3.1, 14.1
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      loadingInterceptor,
      authInterceptor,
      errorInterceptor
    ]))
  ]
};
