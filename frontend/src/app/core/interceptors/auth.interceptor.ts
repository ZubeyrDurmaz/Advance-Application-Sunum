import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, Observable, retry, timer } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

/**
 * AuthInterceptor
 * 
 * HTTP interceptor that handles JWT token injection and automatic token refresh.
 * 
 * Responsibilities:
 * - Inject Authorization header with Bearer token into outgoing requests
 * - Exclude authentication endpoints (/api/auth/login, /api/auth/signup) from token injection
 * - Handle 401 responses by attempting token refresh
 * - Retry failed requests after successful token refresh
 * - Queue subsequent requests during token refresh to prevent multiple refresh attempts
 * - Redirect to login on refresh failure
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 * 
 * @example
 * ```typescript
 * // In app.config.ts
 * provideHttpClient(withInterceptors([authInterceptor]))
 * ```
 */

// Queue to hold requests while token refresh is in progress
let isRefreshing = false;
const requestQueue: Array<{
  req: HttpRequest<any>;
  next: HttpHandlerFn;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);

  // Check if this is an auth endpoint that should be excluded from token injection
  const isAuthEndpoint = req.url.includes('/api/auth/login') || 
                         req.url.includes('/api/auth/signup');

  // Get access token from storage
  const token = tokenStorage.getAccessToken();

  // Clone request and add Authorization header if token exists and not an excluded endpoint
  if (token && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // Handle the request with retry logic and 401 handling
  const isSafeMethod = req.method === 'GET';

  return next(req).pipe(
    // Retry on network errors for safe (GET) requests only — max 2 attempts with exponential backoff
    isSafeMethod
      ? retry({
          count: 2,
          delay: (error: HttpErrorResponse, retryCount: number) => {
            // Don't retry 4xx errors (except 401 which is handled separately)
            if (error.status >= 400 && error.status < 500) {
              throw error;
            }
            // Exponential backoff: 1s, 2s
            return timer(1000 * retryCount);
          }
        })
      : (source) => source,
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 errors for non-auth endpoints
      if (error.status === 401 && !req.url.includes('/api/auth/refresh') && !isAuthEndpoint) {
        return handle401Error(req, next, auth, tokenStorage);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Handle 401 Unauthorized errors by attempting token refresh
 * Queues subsequent requests while refresh is in progress
 * 
 * @param req Original HTTP request that failed with 401
 * @param next HTTP handler function
 * @param auth AuthService instance
 * @param tokenStorage TokenStorageService instance
 * @returns Observable that retries the request with new token or throws error
 */
function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  auth: AuthService,
  tokenStorage: TokenStorageService
): Observable<any> {
  // If refresh is already in progress, queue this request
  if (isRefreshing) {
    return new Observable(observer => {
      requestQueue.push({
        req,
        next,
        resolve: (value) => observer.next(value),
        reject: (error) => observer.error(error)
      });
    });
  }

  // Start token refresh process
  isRefreshing = true;

  const refreshToken = tokenStorage.getRefreshToken();
  
  // If no refresh token available, logout and redirect
  if (!refreshToken) {
    isRefreshing = false;
    auth.logout().subscribe();
    return throwError(() => new Error('No refresh token available'));
  }

  // Attempt token refresh
  return auth.refreshToken().pipe(
    switchMap((res) => {
      // Token refresh successful
      isRefreshing = false;

      // Process queued requests with new token
      processQueue(res.accessToken, tokenStorage, null);

      // Retry the original request with new token
      const clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${res.accessToken}` }
      });
      return next(clonedReq);
    }),
    catchError((error) => {
      // Token refresh failed
      isRefreshing = false;

      // Reject all queued requests
      processQueue(null, tokenStorage, error);

      // Logout and redirect to login
      auth.logout().subscribe();

      return throwError(() => error);
    })
  );
}

/**
 * Process queued requests after token refresh completes
 * 
 * @param token New access token (null if refresh failed)
 * @param tokenStorage TokenStorageService instance
 * @param error Error from refresh failure (null if refresh succeeded)
 */
function processQueue(
  token: string | null,
  tokenStorage: TokenStorageService,
  error: any
): void {
  // Process all queued requests
  requestQueue.forEach(({ req, next, resolve, reject }) => {
    if (error) {
      // Refresh failed, reject all queued requests
      reject(error);
    } else if (token) {
      // Refresh succeeded, retry queued requests with new token
      const clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      next(clonedReq).subscribe({
        next: (value) => resolve(value),
        error: (err) => reject(err)
      });
    }
  });

  // Clear the queue
  requestQueue.length = 0;
}
