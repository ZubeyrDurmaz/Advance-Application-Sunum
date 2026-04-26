import { HttpInterceptorFn, HttpErrorResponse, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler.service';

/** Token to bypass global error handling for specific requests */
export const SKIP_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);

/**
 * ErrorInterceptor
 * 
 * HTTP interceptor that handles error responses from the backend.
 * 
 * Responsibilities:
 * - Intercept HTTP error responses
 * - Delegate error handling to ErrorHandlerService
 * - Transform errors into user-friendly messages
 * 
 * Requirements: 9.1, 9.2
 * 
 * @example
 * ```typescript
 * // In app.config.ts
 * provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor]))
 * ```
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_ERROR_HANDLING)) {
    return next(req);
  }

  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error) => {
      // Only handle HTTP errors
      if (error instanceof HttpErrorResponse) {
        // Delegate to ErrorHandlerService for centralized error handling
        return errorHandler.handleError(error);
      }
      
      // For non-HTTP errors, just pass them through
      return throwError(() => error);
    })
  );
};
