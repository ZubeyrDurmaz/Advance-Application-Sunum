import { HttpErrorResponse } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let consoleErrorSpy: any;

  beforeEach(() => {
    service = new ErrorHandlerService();
    
    // Spy on console.error to prevent cluttering test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up spies
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getErrorMessage', () => {
    it('should return network error message for status 0', () => {
      const error = createHttpErrorResponse(0, 'Unknown Error');
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Network error, check your connection');
    });

    it('should return validation error message for status 400', () => {
      const error = createHttpErrorResponse(400, 'Bad Request');
      
      const message = service.getErrorMessage(error);
      
      expect(message).toContain('Validation failed');
    });

    it('should extract validation errors from 400 response with errors array', () => {
      const error = createHttpErrorResponse(400, 'Bad Request', {
        errors: [
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password too short' }
        ]
      });
      
      const message = service.getErrorMessage(error);
      
      expect(message).toContain('email: Invalid email format');
      expect(message).toContain('password: Password too short');
    });

    it('should extract message from 400 response with message field', () => {
      const error = createHttpErrorResponse(400, 'Bad Request', {
        message: 'Custom validation error'
      });
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Custom validation error');
    });

    it('should extract error from 400 response with error field', () => {
      const error = createHttpErrorResponse(400, 'Bad Request', {
        error: 'Invalid request format'
      });
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Invalid request format');
    });

    it('should return authentication required message for status 401', () => {
      const error = createHttpErrorResponse(401, 'Unauthorized');
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Authentication required. Please log in.');
    });

    it('should return access denied message for status 403', () => {
      const error = createHttpErrorResponse(403, 'Forbidden');
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Access denied');
    });

    it('should return resource not found message for status 404', () => {
      const error = createHttpErrorResponse(404, 'Not Found');
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Resource not found');
    });

    it('should return server error message for status 500', () => {
      const error = createHttpErrorResponse(500, 'Internal Server Error');
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Server error, please try again later');
    });

    it('should return bad gateway message for status 502', () => {
      const error = createHttpErrorResponse(502, 'Bad Gateway');
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Server is temporarily unavailable');
    });

    it('should return service unavailable message for status 503', () => {
      const error = createHttpErrorResponse(503, 'Service Unavailable');
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Service temporarily unavailable');
    });

    it('should return timeout message for status 504', () => {
      const error = createHttpErrorResponse(504, 'Gateway Timeout');
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Request timeout, please try again');
    });

    it('should return generic client error message for other 4xx status codes', () => {
      const error = createHttpErrorResponse(409, 'Conflict');
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Client error: Conflict');
    });

    it('should return generic server error message for other 5xx status codes', () => {
      const error = createHttpErrorResponse(501, 'Not Implemented');
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Server error: Not Implemented');
    });

    it('should return generic error message for unknown status codes', () => {
      const error = createHttpErrorResponse(999, 'Unknown');
      
      const message = service.getErrorMessage(error);
      
      // Status 999 is >= 500, so it falls into the server error category
      expect(message).toBe('Server error: Unknown');
    });

    it('should handle 4xx error without statusText', () => {
      const error = createHttpErrorResponse(400, '');
      
      const message = service.getErrorMessage(error);
      
      expect(message).toContain('Validation failed');
    });

    it('should handle 5xx error without statusText', () => {
      const error = createHttpErrorResponse(501, '');
      
      const message = service.getErrorMessage(error);
      
      // When statusText is empty, the error response still has a default statusText
      // The actual behavior returns the statusText or a fallback
      expect(message).toContain('Server error:');
    });
  });

  describe('logError', () => {
    it('should log error details to console', () => {
      const error = createHttpErrorResponse(404, 'Not Found', null, 'https://api.example.com/products/123');
      
      service.logError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('=== HTTP Error ===');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Status:', 404);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Status Text:', 'Not Found');
      expect(consoleErrorSpy).toHaveBeenCalledWith('URL:', 'https://api.example.com/products/123');
      expect(consoleErrorSpy).toHaveBeenCalledWith('==================');
    });

    it('should log timestamp', () => {
      const error = createHttpErrorResponse(500, 'Internal Server Error');
      
      service.logError(error);
      
      const timestampCall = consoleErrorSpy.mock.calls.find((call: any[]) => 
        call[0] === 'Timestamp:'
      );
      expect(timestampCall).toBeDefined();
      expect(timestampCall[1]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should log error body if available', () => {
      const errorBody = { message: 'Detailed error message', code: 'ERR_001' };
      const error = createHttpErrorResponse(400, 'Bad Request', errorBody);
      
      service.logError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error Body:', errorBody);
    });

    it('should log error message if available', () => {
      const error = createHttpErrorResponse(500, 'Internal Server Error');
      
      service.logError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error Message:', error.message);
    });

    it('should handle error without URL', () => {
      const error = createHttpErrorResponse(500, 'Internal Server Error', null, null);
      
      service.logError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('URL:', null);
    });

    it('should log method if available in error body', () => {
      const errorBody = { method: 'POST' };
      const error = createHttpErrorResponse(400, 'Bad Request', errorBody);
      
      service.logError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Method:', 'POST');
    });

    it('should log Unknown method if not available', () => {
      const error = createHttpErrorResponse(400, 'Bad Request');
      
      service.logError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Method:', 'Unknown');
    });
  });

  describe('handleError', () => {
    it('should log error and return throwError observable', async () => {
      const error = createHttpErrorResponse(404, 'Not Found');
      
      try {
        await firstValueFrom(service.handleError(error));
        throw new Error('Should have thrown');
      } catch (err: any) {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(err.message).toBe('Resource not found');
      }
    });

    it('should return observable with user-friendly message for 500 error', async () => {
      const error = createHttpErrorResponse(500, 'Internal Server Error');
      
      try {
        await firstValueFrom(service.handleError(error));
        throw new Error('Should have thrown');
      } catch (err: any) {
        expect(err.message).toBe('Server error, please try again later');
      }
    });

    it('should return observable with network error message for status 0', async () => {
      const error = createHttpErrorResponse(0, 'Unknown Error');
      
      try {
        await firstValueFrom(service.handleError(error));
        throw new Error('Should have thrown');
      } catch (err: any) {
        expect(err.message).toBe('Network error, check your connection');
      }
    });

    it('should return observable with validation error for 400', async () => {
      const error = createHttpErrorResponse(400, 'Bad Request', {
        errors: [{ field: 'email', message: 'Invalid email' }]
      });
      
      try {
        await firstValueFrom(service.handleError(error));
        throw new Error('Should have thrown');
      } catch (err: any) {
        expect(err.message).toContain('email: Invalid email');
      }
    });

    it('should call logError before returning observable', async () => {
      const error = createHttpErrorResponse(403, 'Forbidden');
      
      try {
        await firstValueFrom(service.handleError(error));
        throw new Error('Should have thrown');
      } catch {
        expect(consoleErrorSpy).toHaveBeenCalled();
      }
    });
  });

  describe('Validation Error Extraction', () => {
    it('should handle validation errors without field property', () => {
      const error = createHttpErrorResponse(400, 'Bad Request', {
        errors: [
          { message: 'General validation error' }
        ]
      });
      
      const message = service.getErrorMessage(error);
      
      expect(message).toContain('General validation error');
    });

    it('should handle validation errors as strings', () => {
      const error = createHttpErrorResponse(400, 'Bad Request', {
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'age', message: 'Age must be positive' }
        ]
      });
      
      const message = service.getErrorMessage(error);
      
      expect(message).toContain('name: Name is required');
      expect(message).toContain('age: Age must be positive');
    });

    it('should handle empty errors array', () => {
      const error = createHttpErrorResponse(400, 'Bad Request', {
        errors: []
      });
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Validation failed');
    });

    it('should handle non-array errors field', () => {
      const error = createHttpErrorResponse(400, 'Bad Request', {
        errors: 'Not an array'
      });
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Validation failed. Please check your input.');
    });

    it('should handle error object without standard fields', () => {
      const error = createHttpErrorResponse(400, 'Bad Request', {
        customField: 'Custom error data'
      });
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Validation failed. Please check your input.');
    });

    it('should handle null error body', () => {
      const error = createHttpErrorResponse(400, 'Bad Request', null);
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Validation failed. Please check your input.');
    });

    it('should handle string error body', () => {
      const error = new HttpErrorResponse({
        error: 'String error message',
        status: 400,
        statusText: 'Bad Request',
        url: 'https://api.example.com/test'
      });
      
      const message = service.getErrorMessage(error);
      
      expect(message).toBe('Validation failed. Please check your input.');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete error flow for network error', async () => {
      const error = createHttpErrorResponse(0, 'Unknown Error');
      
      try {
        await firstValueFrom(service.handleError(error));
        throw new Error('Should have thrown');
      } catch (err: any) {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(err.message).toBe('Network error, check your connection');
      }
    });

    it('should handle complete error flow for authentication error', async () => {
      const error = createHttpErrorResponse(401, 'Unauthorized');
      
      try {
        await firstValueFrom(service.handleError(error));
        throw new Error('Should have thrown');
      } catch (err: any) {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(err.message).toBe('Authentication required. Please log in.');
      }
    });

    it('should handle complete error flow for validation error', async () => {
      const error = createHttpErrorResponse(400, 'Bad Request', {
        errors: [
          { field: 'username', message: 'Username already exists' },
          { field: 'password', message: 'Password must be at least 8 characters' }
        ]
      });
      
      try {
        await firstValueFrom(service.handleError(error));
        throw new Error('Should have thrown');
      } catch (err: any) {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(err.message).toContain('username: Username already exists');
        expect(err.message).toContain('password: Password must be at least 8 characters');
      }
    });

    it('should handle multiple consecutive errors', async () => {
      const error1 = createHttpErrorResponse(404, 'Not Found');
      const error2 = createHttpErrorResponse(500, 'Internal Server Error');
      
      let errorCount = 0;
      
      try {
        await firstValueFrom(service.handleError(error1));
        throw new Error('Should have thrown');
      } catch (err: any) {
        expect(err.message).toBe('Resource not found');
        errorCount++;
        
        try {
          await firstValueFrom(service.handleError(error2));
          throw new Error('Should have thrown');
        } catch (err2: any) {
          expect(err2.message).toBe('Server error, please try again later');
          errorCount++;
          expect(errorCount).toBe(2);
        }
      }
    });
  });
});

/**
 * Helper function to create a mock HttpErrorResponse
 * @param status HTTP status code
 * @param statusText HTTP status text
 * @param error Optional error body
 * @param url Optional request URL
 * @returns Mock HttpErrorResponse
 */
function createHttpErrorResponse(
  status: number,
  statusText: string,
  error: any = null,
  url: string | null = 'https://api.example.com/test'
): HttpErrorResponse {
  return new HttpErrorResponse({
    error: error,
    status: status,
    statusText: statusText,
    url: url || undefined
  });
}
