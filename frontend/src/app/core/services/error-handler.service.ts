import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';

/**
 * ErrorHandlerService
 * 
 * Centralized HTTP error handling service that maps status codes to user-friendly messages
 * and logs errors for debugging purposes.
 * 
 * Error Mapping:
 * - 400 Bad Request → Extract validation errors from response body
 * - 401 Unauthorized → Trigger authentication flow
 * - 403 Forbidden → "Access denied"
 * - 404 Not Found → "Resource not found"
 * - 500 Internal Server Error → "Server error, please try again later"
 * - Network errors → "Network error, check your connection"
 * 
 * @example
 * ```typescript
 * // In an interceptor or service
 * return this.http.get(url).pipe(
 *   catchError(error => {
 *     if (error instanceof HttpErrorResponse) {
 *       return this.errorHandler.handleError(error);
 *     }
 *     return throwError(() => error);
 *   })
 * );
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  private errorSubject = new Subject<string>();
  readonly error$ = this.errorSubject.asObservable();

  constructor() { }

  /**
   * Handle HTTP error responses
   * Logs the error and returns an Observable that throws a user-friendly error message
   * 
   * @param error HttpErrorResponse from failed HTTP request
   * @returns Observable that throws an error with user-friendly message
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    // Log error for debugging
    this.logError(error);

    // Get user-friendly error message
    const message = this.getErrorMessage(error);

    // Emit to notification subscribers (skip 401 — handled by auth interceptor)
    if (error.status !== 401) {
      this.errorSubject.next(message);
    }

    // Return observable that throws the error
    return throwError(() => new Error(message));
  }

  /**
   * Get user-friendly error message based on HTTP status code
   * 
   * @param error HttpErrorResponse from failed HTTP request
   * @returns User-friendly error message
   */
  getErrorMessage(error: HttpErrorResponse): string {
    // Network error (no response from server)
    if (error.status === 0) {
      return 'Network error, check your connection';
    }

    // Handle specific status codes
    switch (error.status) {
      case 400:
        // Bad Request - extract validation errors if available
        return this.extractValidationErrors(error);
      
      case 401:
        // Unauthorized - authentication required
        return 'Authentication required. Please log in.';
      
      case 403:
        // Forbidden - access denied
        return 'Access denied';
      
      case 404:
        // Not Found
        return 'Resource not found';
      
      case 500:
        // Internal Server Error
        return 'Server error, please try again later';
      
      case 502:
        // Bad Gateway
        return 'Server is temporarily unavailable';
      
      case 503:
        // Service Unavailable
        return 'Service temporarily unavailable';
      
      case 504:
        // Gateway Timeout
        return 'Request timeout, please try again';
      
      default:
        // Generic error message for other status codes
        if (error.status >= 400 && error.status < 500) {
          return `Client error: ${error.statusText || 'Bad request'}`;
        } else if (error.status >= 500) {
          return `Server error: ${error.statusText || 'Internal server error'}`;
        }
        return 'An unexpected error occurred';
    }
  }

  /**
   * Log error to console with request details for debugging
   * 
   * @param error HttpErrorResponse from failed HTTP request
   */
  logError(error: HttpErrorResponse): void {
    const timestamp = new Date().toISOString();
    
    console.error('=== HTTP Error ===');
    console.error('Timestamp:', timestamp);
    console.error('Status:', error.status);
    console.error('Status Text:', error.statusText);
    console.error('URL:', error.url);
    console.error('Method:', error.error?.method || 'Unknown');
    
    // Log error body if available
    if (error.error) {
      console.error('Error Body:', error.error);
    }
    
    // Log error message if available
    if (error.message) {
      console.error('Error Message:', error.message);
    }
    
    console.error('==================');
  }

  /**
   * Extract validation errors from 400 Bad Request response
   * 
   * @param error HttpErrorResponse with status 400
   * @returns Formatted validation error message
   */
  private extractValidationErrors(error: HttpErrorResponse): string {
    // Check if error body contains validation errors
    if (error.error && typeof error.error === 'object') {
      // Check for Spring Boot validation error format
      if (error.error.errors && Array.isArray(error.error.errors)) {
        const validationErrors = error.error.errors
          .map((err: any) => {
            if (err.field && err.message) {
              return `${err.field}: ${err.message}`;
            }
            return err.message || JSON.stringify(err);
          })
          .join('; ');
        
        return validationErrors || 'Validation failed';
      }
      
      // Check for simple message field
      if (error.error.message) {
        return error.error.message;
      }
      
      // Check for error field
      if (error.error.error) {
        return error.error.error;
      }
    }
    
    // Fallback to generic validation error message
    return 'Validation failed. Please check your input.';
  }
}
