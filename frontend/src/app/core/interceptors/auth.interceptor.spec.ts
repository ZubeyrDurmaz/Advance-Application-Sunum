import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;
  let tokenStorage: jasmine.SpyObj<TokenStorageService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Create spy objects for dependencies
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['refreshToken', 'logout']);
    const tokenStorageSpy = jasmine.createSpyObj('TokenStorageService', [
      'getAccessToken',
      'getRefreshToken',
      'storeAccessToken',
      'storeRefreshToken'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TokenStorageService, useValue: tokenStorageSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    tokenStorage = TestBed.inject(TokenStorageService) as jasmine.SpyObj<TokenStorageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Test: Token injection into requests
   * Requirement: 3.1, 3.2, 3.3
   */
  it('should add Authorization header with Bearer token to requests', (done) => {
    const testToken = 'test-access-token';
    tokenStorage.getAccessToken.and.returnValue(testToken);

    httpClient.get('/api/products').subscribe({
      next: () => {
        done();
      },
      error: () => fail('Request should succeed')
    });

    const req = httpMock.expectOne('/api/products');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);
    req.flush({ data: 'test' });
  });

  /**
   * Test: Exclusion of auth endpoints
   * Requirement: 3.4
   */
  it('should NOT add Authorization header to /api/auth/login endpoint', (done) => {
    const testToken = 'test-access-token';
    tokenStorage.getAccessToken.and.returnValue(testToken);

    httpClient.post('/api/auth/login', { email: 'test@example.com', password: 'password' }).subscribe({
      next: () => {
        done();
      },
      error: () => fail('Request should succeed')
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ accessToken: 'new-token' });
  });

  /**
   * Test: Exclusion of auth endpoints
   * Requirement: 3.4
   */
  it('should NOT add Authorization header to /api/auth/signup endpoint', (done) => {
    const testToken = 'test-access-token';
    tokenStorage.getAccessToken.and.returnValue(testToken);

    httpClient.post('/api/auth/signup', { name: 'Test', email: 'test@example.com', password: 'password' }).subscribe({
      next: () => {
        done();
      },
      error: () => fail('Request should succeed')
    });

    const req = httpMock.expectOne('/api/auth/signup');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ accessToken: 'new-token' });
  });

  /**
   * Test: Request without token
   * Requirement: 3.2
   */
  it('should NOT add Authorization header when no token exists', (done) => {
    tokenStorage.getAccessToken.and.returnValue(null);

    httpClient.get('/api/products').subscribe({
      next: () => {
        done();
      },
      error: () => fail('Request should succeed')
    });

    const req = httpMock.expectOne('/api/products');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ data: 'test' });
  });

  /**
   * Test: 401 handling and token refresh flow
   * Requirement: 3.5, 3.6
   */
  it('should attempt token refresh on 401 response and retry request', (done) => {
    const oldToken = 'old-access-token';
    const newToken = 'new-access-token';
    const refreshToken = 'refresh-token';

    tokenStorage.getAccessToken.and.returnValue(oldToken);
    tokenStorage.getRefreshToken.and.returnValue(refreshToken);

    // Mock successful token refresh
    authService.refreshToken.and.returnValue(of({
      accessToken: newToken,
      refreshToken: 'new-refresh-token',
      name: 'Test User',
      email: 'test@example.com',
      role: 'INDIVIDUAL'
    }));

    httpClient.get('/api/orders').subscribe({
      next: (response) => {
        expect(response).toEqual({ data: 'orders' });
        expect(authService.refreshToken).toHaveBeenCalled();
        done();
      },
      error: () => fail('Request should succeed after token refresh')
    });

    // First request with old token returns 401
    const req1 = httpMock.expectOne('/api/orders');
    expect(req1.request.headers.get('Authorization')).toBe(`Bearer ${oldToken}`);
    req1.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    // After token refresh, request is retried with new token
    const req2 = httpMock.expectOne('/api/orders');
    expect(req2.request.headers.get('Authorization')).toBe(`Bearer ${newToken}`);
    req2.flush({ data: 'orders' });
  });

  /**
   * Test: Redirect to login on refresh failure
   * Requirement: 3.7
   */
  it('should redirect to login when token refresh fails', (done) => {
    const oldToken = 'old-access-token';
    const refreshToken = 'refresh-token';

    tokenStorage.getAccessToken.and.returnValue(oldToken);
    tokenStorage.getRefreshToken.and.returnValue(refreshToken);

    // Mock failed token refresh
    authService.refreshToken.and.returnValue(
      throwError(() => new Error('Refresh token expired'))
    );

    // Mock logout to return observable
    authService.logout.and.returnValue(of(void 0));

    httpClient.get('/api/orders').subscribe({
      next: () => fail('Request should fail'),
      error: (error) => {
        expect(authService.refreshToken).toHaveBeenCalled();
        expect(authService.logout).toHaveBeenCalled();
        done();
      }
    });

    // First request with old token returns 401
    const req = httpMock.expectOne('/api/orders');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  /**
   * Test: No refresh token available
   * Requirement: 3.7
   */
  it('should logout and redirect when no refresh token is available', (done) => {
    const oldToken = 'old-access-token';

    tokenStorage.getAccessToken.and.returnValue(oldToken);
    tokenStorage.getRefreshToken.and.returnValue(null); // No refresh token

    // Mock logout to return observable
    authService.logout.and.returnValue(of(void 0));

    httpClient.get('/api/orders').subscribe({
      next: () => fail('Request should fail'),
      error: (error) => {
        expect(authService.logout).toHaveBeenCalled();
        expect(authService.refreshToken).not.toHaveBeenCalled();
        done();
      }
    });

    // First request with old token returns 401
    const req = httpMock.expectOne('/api/orders');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  /**
   * Test: Non-401 errors should pass through
   * Requirement: 3.5
   */
  it('should NOT attempt token refresh for non-401 errors', (done) => {
    const testToken = 'test-access-token';
    tokenStorage.getAccessToken.and.returnValue(testToken);

    httpClient.get('/api/products').subscribe({
      next: () => fail('Request should fail'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(authService.refreshToken).not.toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne('/api/products');
    req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
  });

  /**
   * Test: Queue subsequent requests during token refresh
   * Requirement: 3.6
   */
  it('should queue subsequent requests during token refresh', (done) => {
    const oldToken = 'old-access-token';
    const newToken = 'new-access-token';
    const refreshToken = 'refresh-token';

    tokenStorage.getAccessToken.and.returnValue(oldToken);
    tokenStorage.getRefreshToken.and.returnValue(refreshToken);

    // Mock successful token refresh with delay
    authService.refreshToken.and.returnValue(of({
      accessToken: newToken,
      refreshToken: 'new-refresh-token',
      name: 'Test User',
      email: 'test@example.com',
      role: 'INDIVIDUAL'
    }));

    let firstRequestCompleted = false;
    let secondRequestCompleted = false;

    // First request
    httpClient.get('/api/orders').subscribe({
      next: () => {
        firstRequestCompleted = true;
        if (secondRequestCompleted) {
          done();
        }
      },
      error: () => fail('First request should succeed')
    });

    // Second request (should be queued)
    httpClient.get('/api/products').subscribe({
      next: () => {
        secondRequestCompleted = true;
        if (firstRequestCompleted) {
          done();
        }
      },
      error: () => fail('Second request should succeed')
    });

    // First request returns 401
    const req1 = httpMock.expectOne('/api/orders');
    req1.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    // Second request returns 401 (should be queued)
    const req2 = httpMock.expectOne('/api/products');
    req2.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    // After token refresh, both requests are retried
    const retryReq1 = httpMock.expectOne('/api/orders');
    retryReq1.flush({ data: 'orders' });

    const retryReq2 = httpMock.expectOne('/api/products');
    retryReq2.flush({ data: 'products' });
  });

  /**
   * Test: Should not intercept /api/auth/refresh endpoint
   * Requirement: 3.5
   */
  it('should NOT intercept 401 errors from /api/auth/refresh endpoint', (done) => {
    const testToken = 'test-access-token';
    tokenStorage.getAccessToken.and.returnValue(testToken);

    httpClient.post('/api/auth/refresh', { refreshToken: 'test-refresh' }).subscribe({
      next: () => fail('Request should fail'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        expect(authService.refreshToken).not.toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne('/api/auth/refresh');
    req.flush({ message: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });
  });
});
