import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { AuthResponse, User } from '../models/auth.model';
import { environment } from '../../../environments/environment';

/**
 * Unit tests for AuthService
 * 
 * Tests cover:
 * - Login flow (Requirements 2.1, 2.2, 2.5)
 * - Signup flow (Requirements 2.3, 2.4, 2.5)
 * - Token refresh (Requirements 4.1, 4.2, 4.3, 4.4, 4.5)
 * - Logout flow (Requirements 2.6, 16.1, 16.2, 16.3, 16.4)
 * - User profile retrieval (Requirements 2.5, 11.1, 11.2, 11.3)
 */
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenStorage: TokenStorageService;
  let router: Router;
  const API_URL = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    const routerMock = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        AuthService,
        TokenStorageService,
        { provide: Router, useValue: routerMock }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenStorage = TestBed.inject(TokenStorageService);
    router = TestBed.inject(Router);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Login Method (Requirement 2.1, 2.2, 2.5)', () => {
    it('should send POST request to /api/auth/login with credentials', () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse: AuthResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        name: 'Test User',
        email: email,
        role: 'INDIVIDUAL'
      };

      service.login(email, password).subscribe();

      const req = httpMock.expectOne(`${API_URL}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockResponse);
    });

    it('should store tokens and user information on successful login', () => {
      return new Promise<void>((resolve) => {
        const email = 'test@example.com';
        const password = 'password123';
        const mockResponse: AuthResponse = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          name: 'Test User',
          email: email,
          role: 'INDIVIDUAL'
        };

        service.login(email, password).subscribe(() => {
          expect(tokenStorage.getAccessToken()).toBe(mockResponse.accessToken);
          expect(tokenStorage.getRefreshToken()).toBe(mockResponse.refreshToken);
          
          const storedUser = tokenStorage.getUser();
          expect(storedUser).toEqual({
            name: mockResponse.name,
            email: mockResponse.email,
            role: mockResponse.role
          });
          resolve();
        });

        const req = httpMock.expectOne(`${API_URL}/login`);
        req.flush(mockResponse);
      });
    });

    it('should update authentication state on successful login', () => {
      return new Promise<void>((resolve) => {
        const email = 'test@example.com';
        const password = 'password123';
        const mockResponse: AuthResponse = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          name: 'Test User',
          email: email,
          role: 'INDIVIDUAL'
        };

        service.login(email, password).subscribe(() => {
          expect(service.isAuthenticated()).toBe(true);
          expect(service.getCurrentUser()).toEqual({
            name: mockResponse.name,
            email: mockResponse.email,
            role: mockResponse.role
          });
          resolve();
        });

        const req = httpMock.expectOne(`${API_URL}/login`);
        req.flush(mockResponse);
      });
    });

    it('should handle login error', () => {
      return new Promise<void>((resolve) => {
        const email = 'test@example.com';
        const password = 'wrong-password';

        service.login(email, password).subscribe({
          next: () => {
            throw new Error('should have failed');
          },
          error: (error) => {
            expect(error.status).toBe(401);
            expect(tokenStorage.getAccessToken()).toBeNull();
            resolve();
          }
        });

        const req = httpMock.expectOne(`${API_URL}/login`);
        req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
      });
    });
  });

  describe('Signup Method (Requirement 2.3, 2.4, 2.5)', () => {
    it('should send POST request to /api/auth/signup with user data', () => {
      const name = 'New User';
      const email = 'newuser@example.com';
      const password = 'password123';
      const role = 'CORPORATE';
      const mockResponse: AuthResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        name: name,
        email: email,
        role: role
      };

      service.signup(name, email, password, role).subscribe();

      const req = httpMock.expectOne(`${API_URL}/signup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name, email, password, role });
      req.flush(mockResponse);
    });

    it('should store tokens and user information on successful signup', () => {
      return new Promise<void>((resolve) => {
        const name = 'New User';
        const email = 'newuser@example.com';
        const password = 'password123';
        const mockResponse: AuthResponse = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          name: name,
          email: email,
          role: 'INDIVIDUAL'
        };

        service.signup(name, email, password).subscribe(() => {
          expect(tokenStorage.getAccessToken()).toBe(mockResponse.accessToken);
          expect(tokenStorage.getRefreshToken()).toBe(mockResponse.refreshToken);
          
          const storedUser = tokenStorage.getUser();
          expect(storedUser).toEqual({
            name: mockResponse.name,
            email: mockResponse.email,
            role: mockResponse.role
          });
          resolve();
        });

        const req = httpMock.expectOne(`${API_URL}/signup`);
        req.flush(mockResponse);
      });
    });

    it('should handle signup error', () => {
      return new Promise<void>((resolve) => {
        const name = 'New User';
        const email = 'existing@example.com';
        const password = 'password123';

        service.signup(name, email, password).subscribe({
          next: () => {
            throw new Error('should have failed');
          },
          error: (error) => {
            expect(error.status).toBe(400);
            expect(tokenStorage.getAccessToken()).toBeNull();
            resolve();
          }
        });

        const req = httpMock.expectOne(`${API_URL}/signup`);
        req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
      });
    });
  });

  describe('Token Refresh Method (Requirement 4.1, 4.2, 4.3, 4.4, 4.5)', () => {
    it('should send POST request to /api/auth/refresh with refresh token', () => {
      const refreshToken = 'mock-refresh-token';
      tokenStorage.storeRefreshToken(refreshToken);

      const mockResponse: AuthResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        name: 'Test User',
        email: 'test@example.com',
        role: 'INDIVIDUAL'
      };

      service.refreshToken().subscribe();

      const req = httpMock.expectOne(`${API_URL}/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken });
      req.flush(mockResponse);
    });

    it('should update tokens in storage on successful refresh', () => {
      return new Promise<void>((resolve) => {
        const oldRefreshToken = 'old-refresh-token';
        tokenStorage.storeRefreshToken(oldRefreshToken);

        const mockResponse: AuthResponse = {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          name: 'Test User',
          email: 'test@example.com',
          role: 'INDIVIDUAL'
        };

        service.refreshToken().subscribe(() => {
          expect(tokenStorage.getAccessToken()).toBe(mockResponse.accessToken);
          expect(tokenStorage.getRefreshToken()).toBe(mockResponse.refreshToken);
          resolve();
        });

        const req = httpMock.expectOne(`${API_URL}/refresh`);
        req.flush(mockResponse);
      });
    });

    it('should clear tokens and emit unauthenticated state on refresh failure', () => {
      return new Promise<void>((resolve) => {
        const refreshToken = 'invalid-refresh-token';
        tokenStorage.storeRefreshToken(refreshToken);
        tokenStorage.storeAccessToken('old-access-token');

        service.refreshToken().subscribe({
          next: () => {
            throw new Error('should have failed');
          },
          error: () => {
            expect(tokenStorage.getAccessToken()).toBeNull();
            expect(tokenStorage.getRefreshToken()).toBeNull();
            expect(service.isAuthenticated()).toBe(false);
            resolve();
          }
        });

        const req = httpMock.expectOne(`${API_URL}/refresh`);
        req.flush({ message: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });
      });
    });

    it('should prevent multiple simultaneous refresh requests', () => {
      return new Promise<void>((resolve) => {
        const refreshToken = 'mock-refresh-token';
        tokenStorage.storeRefreshToken(refreshToken);

        const mockResponse: AuthResponse = {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          name: 'Test User',
          email: 'test@example.com',
          role: 'INDIVIDUAL'
        };

        // Start first refresh
        const refresh1 = service.refreshToken();
        // Start second refresh immediately
        const refresh2 = service.refreshToken();

        // Both should reference the same observable
        expect(refresh1).toBe(refresh2);

        let completedCount = 0;
        const checkCompletion = () => {
          completedCount++;
          if (completedCount === 2) {
            // Only one HTTP request should have been made
            httpMock.verify();
            resolve();
          }
        };

        refresh1.subscribe(() => checkCompletion());
        refresh2.subscribe(() => checkCompletion());

        // Only one request should be pending
        const req = httpMock.expectOne(`${API_URL}/refresh`);
        req.flush(mockResponse);
      });
    });

    it('should return error when no refresh token is available', () => {
      return new Promise<void>((resolve) => {
        service.refreshToken().subscribe({
          next: () => {
            throw new Error('should have failed');
          },
          error: (error) => {
            expect(error.message).toBe('No refresh token available');
            expect(service.isAuthenticated()).toBe(false);
            resolve();
          }
        });

        httpMock.expectNone(`${API_URL}/refresh`);
      });
    });
  });

  describe('Logout Method (Requirement 2.6, 16.1, 16.2, 16.3, 16.4)', () => {
    it('should send POST request to /api/auth/logout', () => {
      return new Promise<void>((resolve) => {
        const accessToken = 'mock-access-token';
        tokenStorage.storeAccessToken(accessToken);

        service.logout().subscribe(() => {
          resolve();
        });

        const req = httpMock.expectOne(`${API_URL}/logout`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({});
        req.flush({});
      });
    });

    it('should clear all tokens from storage', () => {
      return new Promise<void>((resolve) => {
        tokenStorage.storeAccessToken('access-token');
        tokenStorage.storeRefreshToken('refresh-token');
        tokenStorage.storeUser({
          name: 'Test User',
          email: 'test@example.com',
          role: 'INDIVIDUAL'
        });

        service.logout().subscribe(() => {
          expect(tokenStorage.getAccessToken()).toBeNull();
          expect(tokenStorage.getRefreshToken()).toBeNull();
          expect(tokenStorage.getUser()).toBeNull();
          resolve();
        });

        const req = httpMock.expectOne(`${API_URL}/logout`);
        req.flush({});
      });
    });

    it('should redirect to login page', () => {
      return new Promise<void>((resolve) => {
        tokenStorage.storeAccessToken('access-token');

        service.logout().subscribe(() => {
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          resolve();
        });

        const req = httpMock.expectOne(`${API_URL}/logout`);
        req.flush({});
      });
    });

    it('should clear state even if logout request fails', () => {
      return new Promise<void>((resolve) => {
        tokenStorage.storeAccessToken('access-token');
        tokenStorage.storeRefreshToken('refresh-token');

        service.logout().subscribe(() => {
          expect(tokenStorage.getAccessToken()).toBeNull();
          expect(tokenStorage.getRefreshToken()).toBeNull();
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          resolve();
        });

        const req = httpMock.expectOne(`${API_URL}/logout`);
        req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
      });
    });

    it('should handle logout when no token exists', () => {
      return new Promise<void>((resolve) => {
        service.logout().subscribe(() => {
          expect(tokenStorage.getAccessToken()).toBeNull();
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          resolve();
        });

        httpMock.expectNone(`${API_URL}/logout`);
      });
    });
  });

  describe('Get User Profile Method (Requirement 2.5, 11.1, 11.2, 11.3)', () => {
    it('should send GET request to /api/auth/me', () => {
      const mockResponse: AuthResponse = {
        accessToken: '',
        refreshToken: '',
        name: 'Test User',
        email: 'test@example.com',
        role: 'INDIVIDUAL'
      };

      service.getUserProfile().subscribe();

      const req = httpMock.expectOne(`${API_URL}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should update authentication state with user information', () => {
      return new Promise<void>((resolve) => {
        const mockResponse: AuthResponse = {
          accessToken: '',
          refreshToken: '',
          name: 'Test User',
          email: 'test@example.com',
          role: 'CORPORATE'
        };

        service.getUserProfile().subscribe(() => {
          const user = tokenStorage.getUser();
          expect(user).toEqual({
            name: mockResponse.name,
            email: mockResponse.email,
            role: mockResponse.role
          });
          expect(service.isAuthenticated()).toBe(true);
          resolve();
        });

        const req = httpMock.expectOne(`${API_URL}/me`);
        req.flush(mockResponse);
      });
    });

    it('should handle 401 errors by clearing tokens', () => {
      return new Promise<void>((resolve) => {
        tokenStorage.storeAccessToken('invalid-token');
        tokenStorage.storeRefreshToken('refresh-token');

        service.getUserProfile().subscribe({
          next: () => {
            throw new Error('should have failed');
          },
          error: (error) => {
            expect(error.status).toBe(401);
            expect(tokenStorage.getAccessToken()).toBeNull();
            expect(tokenStorage.getRefreshToken()).toBeNull();
            expect(service.isAuthenticated()).toBe(false);
            resolve();
          }
        });

        const req = httpMock.expectOne(`${API_URL}/me`);
        req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
      });
    });
  });

  describe('Helper Methods', () => {
    it('getCurrentUser should return current user from state', () => {
      const user: User = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'INDIVIDUAL'
      };

      (service as any).updateAuthState({ user });
      
      expect(service.getCurrentUser()).toEqual(user);
    });

    it('getCurrentUser should return null when not authenticated', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('isAuthenticated should return true when user is authenticated with valid token', () => {
      const validToken = createMockToken(Math.floor(Date.now() / 1000) + 3600);
      tokenStorage.storeAccessToken(validToken);
      (service as any).updateAuthState({ isAuthenticated: true });

      expect(service.isAuthenticated()).toBe(true);
    });

    it('isAuthenticated should return false when no token exists', () => {
      (service as any).updateAuthState({ isAuthenticated: true });
      
      expect(service.isAuthenticated()).toBe(false);
    });

    it('isAuthenticated should return false when token is expired', () => {
      const expiredToken = createMockToken(Math.floor(Date.now() / 1000) - 3600);
      tokenStorage.storeAccessToken(expiredToken);
      (service as any).updateAuthState({ isAuthenticated: true });

      expect(service.isAuthenticated()).toBe(false);
    });
  });
});

/**
 * Helper function to create a mock JWT token with specified expiration
 * @param exp Expiration time in seconds since epoch
 * @returns Mock JWT token string
 */
function createMockToken(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    sub: 'test-user',
    exp: exp,
    iat: Math.floor(Date.now() / 1000)
  }));
  const signature = 'mock-signature';
  
  return `${header}.${payload}.${signature}`;
}
