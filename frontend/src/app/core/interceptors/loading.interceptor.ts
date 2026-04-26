import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * LoadingInterceptor
 * 
 * HTTP interceptor that tracks request lifecycle for loading state management.
 * 
 * Responsibilities:
 * - Track request start and completion
 * - Update LoadingService state when requests begin and end
 * - Use finalize operator to ensure cleanup happens regardless of success or error
 * 
 * Requirements: 14.1, 14.3, 14.4
 * 
 * @example
 * ```typescript
 * // In app.config.ts
 * provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor]))
 * ```
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Increment loading counter when request starts
  loadingService.setLoading(true);

  // Handle the request and ensure loading state is updated when complete
  return next(req).pipe(
    finalize(() => {
      // Decrement loading counter when request completes (success or error)
      loadingService.setLoading(false);
    })
  );
};
