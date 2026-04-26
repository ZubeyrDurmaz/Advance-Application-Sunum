import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('LoadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    // Create spy object for LoadingService
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['setLoading']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        { provide: LoadingService, useValue: loadingServiceSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Test: Loading state updates on request start
   * Requirement: 14.1, 14.3
   */
  it('should set loading to true when request starts', () => {
    httpClient.get('/api/products').subscribe();

    // Loading should be set to true when request starts
    expect(loadingService.setLoading).toHaveBeenCalledWith(true);

    const req = httpMock.expectOne('/api/products');
    req.flush({ data: 'products' });
  });

  /**
   * Test: Loading state updates on request completion (success)
   * Requirement: 14.3, 14.4
   */
  it('should set loading to false when request completes successfully', (done) => {
    httpClient.get('/api/products').subscribe({
      next: () => {
        // Loading should be set to false after request completes
        expect(loadingService.setLoading).toHaveBeenCalledWith(true);
        expect(loadingService.setLoading).toHaveBeenCalledWith(false);
        expect(loadingService.setLoading).toHaveBeenCalledTimes(2);
        done();
      },
      error: () => fail('Request should succeed')
    });

    const req = httpMock.expectOne('/api/products');
    req.flush({ data: 'products' });
  });

  /**
   * Test: Loading state updates on request completion (error)
   * Requirement: 14.3, 14.4
   */
  it('should set loading to false when request fails', (done) => {
    httpClient.get('/api/products').subscribe({
      next: () => fail('Request should fail'),
      error: () => {
        // Loading should be set to false even when request fails
        expect(loadingService.setLoading).toHaveBeenCalledWith(true);
        expect(loadingService.setLoading).toHaveBeenCalledWith(false);
        expect(loadingService.setLoading).toHaveBeenCalledTimes(2);
        done();
      }
    });

    const req = httpMock.expectOne('/api/products');
    req.flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Internal Server Error' }
    );
  });

  /**
   * Test: Loading state with multiple concurrent requests
   * Requirement: 14.1, 14.3, 14.4
   */
  it('should handle multiple concurrent requests correctly', (done) => {
    let firstRequestCompleted = false;
    let secondRequestCompleted = false;

    // First request
    httpClient.get('/api/products').subscribe({
      next: () => {
        firstRequestCompleted = true;
        if (secondRequestCompleted) {
          // Both requests completed
          // setLoading(true) should be called twice (once per request start)
          // setLoading(false) should be called twice (once per request completion)
          expect(loadingService.setLoading).toHaveBeenCalledWith(true);
          expect(loadingService.setLoading).toHaveBeenCalledWith(false);
          expect(loadingService.setLoading).toHaveBeenCalledTimes(4); // 2 starts + 2 completions
          done();
        }
      },
      error: () => fail('First request should succeed')
    });

    // Second request
    httpClient.get('/api/orders').subscribe({
      next: () => {
        secondRequestCompleted = true;
        if (firstRequestCompleted) {
          // Both requests completed
          expect(loadingService.setLoading).toHaveBeenCalledWith(true);
          expect(loadingService.setLoading).toHaveBeenCalledWith(false);
          expect(loadingService.setLoading).toHaveBeenCalledTimes(4); // 2 starts + 2 completions
          done();
        }
      },
      error: () => fail('Second request should succeed')
    });

    // Complete first request
    const req1 = httpMock.expectOne('/api/products');
    req1.flush({ data: 'products' });

    // Complete second request
    const req2 = httpMock.expectOne('/api/orders');
    req2.flush({ data: 'orders' });
  });

  /**
   * Test: Loading state with sequential requests
   * Requirement: 14.1, 14.3, 14.4
   */
  it('should handle sequential requests correctly', (done) => {
    // First request
    httpClient.get('/api/products').subscribe({
      next: () => {
        // After first request completes, start second request
        httpClient.get('/api/orders').subscribe({
          next: () => {
            // Both requests completed sequentially
            // setLoading(true) should be called twice
            // setLoading(false) should be called twice
            expect(loadingService.setLoading).toHaveBeenCalledWith(true);
            expect(loadingService.setLoading).toHaveBeenCalledWith(false);
            expect(loadingService.setLoading).toHaveBeenCalledTimes(4);
            done();
          },
          error: () => fail('Second request should succeed')
        });

        const req2 = httpMock.expectOne('/api/orders');
        req2.flush({ data: 'orders' });
      },
      error: () => fail('First request should succeed')
    });

    const req1 = httpMock.expectOne('/api/products');
    req1.flush({ data: 'products' });
  });

  /**
   * Test: Loading state with mixed success and error requests
   * Requirement: 14.3, 14.4
   */
  it('should handle mixed success and error requests', (done) => {
    let firstRequestCompleted = false;
    let secondRequestCompleted = false;

    // First request (success)
    httpClient.get('/api/products').subscribe({
      next: () => {
        firstRequestCompleted = true;
        if (secondRequestCompleted) {
          checkCompletion();
        }
      },
      error: () => fail('First request should succeed')
    });

    // Second request (error)
    httpClient.get('/api/orders').subscribe({
      next: () => fail('Second request should fail'),
      error: () => {
        secondRequestCompleted = true;
        if (firstRequestCompleted) {
          checkCompletion();
        }
      }
    });

    function checkCompletion() {
      // Both requests completed (one success, one error)
      // setLoading should be called correctly for both
      expect(loadingService.setLoading).toHaveBeenCalledWith(true);
      expect(loadingService.setLoading).toHaveBeenCalledWith(false);
      expect(loadingService.setLoading).toHaveBeenCalledTimes(4);
      done();
    }

    // Complete first request successfully
    const req1 = httpMock.expectOne('/api/products');
    req1.flush({ data: 'products' });

    // Complete second request with error
    const req2 = httpMock.expectOne('/api/orders');
    req2.flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Internal Server Error' }
    );
  });

  /**
   * Test: Loading state is always cleaned up with finalize
   * Requirement: 14.4
   */
  it('should use finalize operator to ensure cleanup', (done) => {
    httpClient.get('/api/products').subscribe({
      next: () => {
        // Verify that setLoading(false) was called in finalize
        // This ensures cleanup happens regardless of success or error
        expect(loadingService.setLoading).toHaveBeenCalledWith(false);
        done();
      },
      error: () => fail('Request should succeed')
    });

    const req = httpMock.expectOne('/api/products');
    req.flush({ data: 'products' });
  });

  /**
   * Test: Loading state for POST requests
   * Requirement: 14.1, 14.3, 14.4
   */
  it('should handle loading state for POST requests', (done) => {
    httpClient.post('/api/products', { name: 'New Product' }).subscribe({
      next: () => {
        expect(loadingService.setLoading).toHaveBeenCalledWith(true);
        expect(loadingService.setLoading).toHaveBeenCalledWith(false);
        expect(loadingService.setLoading).toHaveBeenCalledTimes(2);
        done();
      },
      error: () => fail('Request should succeed')
    });

    const req = httpMock.expectOne('/api/products');
    req.flush({ id: '1', name: 'New Product' });
  });

  /**
   * Test: Loading state for PUT requests
   * Requirement: 14.1, 14.3, 14.4
   */
  it('should handle loading state for PUT requests', (done) => {
    httpClient.put('/api/products/1', { name: 'Updated Product' }).subscribe({
      next: () => {
        expect(loadingService.setLoading).toHaveBeenCalledWith(true);
        expect(loadingService.setLoading).toHaveBeenCalledWith(false);
        expect(loadingService.setLoading).toHaveBeenCalledTimes(2);
        done();
      },
      error: () => fail('Request should succeed')
    });

    const req = httpMock.expectOne('/api/products/1');
    req.flush({ id: '1', name: 'Updated Product' });
  });

  /**
   * Test: Loading state for DELETE requests
   * Requirement: 14.1, 14.3, 14.4
   */
  it('should handle loading state for DELETE requests', (done) => {
    httpClient.delete('/api/products/1').subscribe({
      next: () => {
        expect(loadingService.setLoading).toHaveBeenCalledWith(true);
        expect(loadingService.setLoading).toHaveBeenCalledWith(false);
        expect(loadingService.setLoading).toHaveBeenCalledTimes(2);
        done();
      },
      error: () => fail('Request should succeed')
    });

    const req = httpMock.expectOne('/api/products/1');
    req.flush({});
  });
});
