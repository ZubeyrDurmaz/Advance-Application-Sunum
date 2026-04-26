import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { ErrorHandlerService } from '../services/error-handler.service';
import { throwError } from 'rxjs';

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let errorHandler: jasmine.SpyObj<ErrorHandlerService>;

  beforeEach(() => {
    // Create spy object for ErrorHandlerService
    const errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', ['handleError', 'getErrorMessage']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: ErrorHandlerService, useValue: errorHandlerSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    errorHandler = TestBed.inject(ErrorHandlerService) as jasmine.SpyObj<ErrorHandlerService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Test: Error interception and delegation
   * Requirement: 9.1
   */
  it('should intercept HTTP errors and delegate to ErrorHandlerService', (done) => {
    const errorMessage = 'Server error, please try again later';
    
    // Mock ErrorHandlerService to return an error observable
    errorHandler.handleError.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    httpClient.get('/api/products').subscribe({
      next: () => fail('Request should fail'),
      error: (error: Error) => {
        expect(errorHandler.handleError).toHaveBeenCalled();
        expect(error.message).toBe(errorMessage);
        done();
      }
    });

    const req = httpMock.expectOne('/api/products');
    req.flush(
      { message: 'Internal server error' },
      { status: 500, statusText: 'Internal Server Error' }
    );
  });

  /**
   * Test: Error transformation for 400 Bad Request
   * Requirement: 9.2
   */
  it('should transform 400 Bad Request errors', (done) => {
    const errorMessage = 'Validation failed. Please check your input.';
    
    errorHandler.handleError.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    httpClient.post('/api/products', { name: '' }).subscribe({
      next: () => fail('Request should fail'),
      error: (error: Error) => {
        expect(errorHandler.handleError).toHaveBeenCalled();
        const callArgs = errorHandler.handleError.calls.mostRecent().args[0];
        expect(callArgs.status).toBe(400);
        done();
      }
    });

    const req = httpMock.expectOne('/api/products');
    req.flush(
      { 
        message: 'Validation failed',
        errors: [
          { field: 'name', message: 'Name is required' }
        ]
      },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  /**
   * Test: Error transformation for 401 Unauthorized
   * Requirement: 9.2
   */
  it('should transform 401 Unauthorized errors', (done) => {
    const errorMessage = 'Authentication required. Please log in.';
    
    errorHandler.handleError.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    httpClient.get('/api/orders').subscribe({
      next: () => fail('Request should fail'),
      error: (error: Error) => {
        expect(errorHandler.handleError).toHaveBeenCalled();
        const callArgs = errorHandler.handleError.calls.mostRecent().args[0];
        expect(callArgs.status).toBe(401);
        done();
      }
    });

    const req = httpMock.expectOne('/api/orders');
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  /**
   * Test: Error transformation for 403 Forbidden
   * Requirement: 9.2
   */
  it('should transform 403 Forbidden errors', (done) => {
    const errorMessage = 'Access denied';
    
    errorHandler.handleError.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    httpClient.get('/api/admin/users').subscribe({
      next: () => fail('Request should fail'),
      error: (error: Error) => {
        expect(errorHandler.handleError).toHaveBeenCalled();
        const callArgs = errorHandler.handleError.calls.mostRecent().args[0];
        expect(callArgs.status).toBe(403);
        done();
      }
    });

    const req = httpMock.expectOne('/api/admin/users');
    req.flush(
      { message: 'Forbidden' },
      { status: 403, statusText: 'Forbidden' }
    );
  });

  /**
   * Test: Error transformation for 404 Not Found
   * Requirement: 9.2
   */
  it('should transform 404 Not Found errors', (done) => {
    const errorMessage = 'Resource not found';
    
    errorHandler.handleError.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    httpClient.get('/api/products/999').subscribe({
      next: () => fail('Request should fail'),
      error: (error: Error) => {
        expect(errorHandler.handleError).toHaveBeenCalled();
        const callArgs = errorHandler.handleError.calls.mostRecent().args[0];
        expect(callArgs.status).toBe(404);
        done();
      }
    });

    const req = httpMock.expectOne('/api/products/999');
    req.flush(
      { message: 'Product not found' },
      { status: 404, statusText: 'Not Found' }
    );
  });

  /**
   * Test: Error transformation for 500 Internal Server Error
   * Requirement: 9.2
   */
  it('should transform 500 Internal Server Error', (done) => {
    const errorMessage = 'Server error, please try again later';
    
    errorHandler.handleError.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    httpClient.get('/api/products').subscribe({
      next: () => fail('Request should fail'),
      error: (error: Error) => {
        expect(errorHandler.handleError).toHaveBeenCalled();
        const callArgs = errorHandler.handleError.calls.mostRecent().args[0];
        expect(callArgs.status).toBe(500);
        done();
      }
    });

    const req = httpMock.expectOne('/api/products');
    req.flush(
      { message: 'Internal server error' },
      { status: 500, statusText: 'Internal Server Error' }
    );
  });

  /**
   * Test: Error transformation for network errors
   * Requirement: 9.2
   */
  it('should transform network errors (status 0)', (done) => {
    const errorMessage = 'Network error, check your connection';
    
    errorHandler.handleError.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    httpClient.get('/api/products').subscribe({
      next: () => fail('Request should fail'),
      error: (error: Error) => {
        expect(errorHandler.handleError).toHaveBeenCalled();
        const callArgs = errorHandler.handleError.calls.mostRecent().args[0];
        expect(callArgs.status).toBe(0);
        done();
      }
    });

    const req = httpMock.expectOne('/api/products');
    req.error(
      new ProgressEvent('error'),
      { status: 0, statusText: 'Unknown Error' }
    );
  });

  /**
   * Test: Non-HTTP errors should pass through
   * Requirement: 9.1
   */
  it('should NOT intercept non-HTTP errors', (done) => {
    const nonHttpError = new Error('Non-HTTP error');
    
    // ErrorHandlerService should not be called for non-HTTP errors
    errorHandler.handleError.and.returnValue(
      throwError(() => nonHttpError)
    );

    httpClient.get('/api/products').subscribe({
      next: () => fail('Request should fail'),
      error: (error: Error) => {
        // ErrorHandlerService should not be called
        expect(errorHandler.handleError).not.toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne('/api/products');
    // Simulate a non-HTTP error by throwing directly
    req.error(new ProgressEvent('error'));
  });

  /**
   * Test: Successful requests should not trigger error handling
   * Requirement: 9.1
   */
  it('should NOT intercept successful requests', (done) => {
    httpClient.get('/api/products').subscribe({
      next: (response) => {
        expect(response).toEqual({ data: 'products' });
        expect(errorHandler.handleError).not.toHaveBeenCalled();
        done();
      },
      error: () => fail('Request should succeed')
    });

    const req = httpMock.expectOne('/api/products');
    req.flush({ data: 'products' });
  });

  /**
   * Test: Multiple concurrent errors should all be handled
   * Requirement: 9.1
   */
  it('should handle multiple concurrent errors', (done) => {
    const errorMessage = 'Server error, please try again later';
    
    errorHandler.handleError.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    let firstErrorHandled = false;
    let secondErrorHandled = false;

    // First request
    httpClient.get('/api/products').subscribe({
      next: () => fail('First request should fail'),
      error: () => {
        firstErrorHandled = true;
        if (secondErrorHandled) {
          expect(errorHandler.handleError).toHaveBeenCalledTimes(2);
          done();
        }
      }
    });

    // Second request
    httpClient.get('/api/orders').subscribe({
      next: () => fail('Second request should fail'),
      error: () => {
        secondErrorHandled = true;
        if (firstErrorHandled) {
          expect(errorHandler.handleError).toHaveBeenCalledTimes(2);
          done();
        }
      }
    });

    const req1 = httpMock.expectOne('/api/products');
    req1.flush({ message: 'Error' }, { status: 500, statusText: 'Internal Server Error' });

    const req2 = httpMock.expectOne('/api/orders');
    req2.flush({ message: 'Error' }, { status: 500, statusText: 'Internal Server Error' });
  });
});
