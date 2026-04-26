import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';
import { User } from '../models/auth.model';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Access Token Management', () => {
    it('should store and retrieve access token', () => {
      const token = 'test-access-token';
      service.storeAccessToken(token);
      
      expect(service.getAccessToken()).toBe(token);
    });

    it('should return null when no access token is stored', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should overwrite existing access token', () => {
      service.storeAccessToken('old-token');
      service.storeAccessToken('new-token');
      
      expect(service.getAccessToken()).toBe('new-token');
    });
  });

  describe('Refresh Token Management', () => {
    it('should store and retrieve refresh token', () => {
      const token = 'test-refresh-token';
      service.storeRefreshToken(token);
      
      expect(service.getRefreshToken()).toBe(token);
    });

    it('should return null when no refresh token is stored', () => {
      expect(service.getRefreshToken()).toBeNull();
    });

    it('should overwrite existing refresh token', () => {
      service.storeRefreshToken('old-refresh-token');
      service.storeRefreshToken('new-refresh-token');
      
      expect(service.getRefreshToken()).toBe('new-refresh-token');
    });
  });

  describe('Token Clearing', () => {
    it('should clear both access and refresh tokens', () => {
      service.storeAccessToken('access-token');
      service.storeRefreshToken('refresh-token');
      
      service.clearTokens();
      
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
    });

    it('should not throw error when clearing non-existent tokens', () => {
      expect(() => service.clearTokens()).not.toThrow();
    });
  });

  describe('User Management', () => {
    const testUser: User = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'INDIVIDUAL'
    };

    it('should store and retrieve user', () => {
      service.storeUser(testUser);
      
      const retrievedUser = service.getUser();
      expect(retrievedUser).toEqual(testUser);
    });

    it('should return null when no user is stored', () => {
      expect(service.getUser()).toBeNull();
    });

    it('should overwrite existing user', () => {
      const oldUser: User = {
        name: 'Old User',
        email: 'old@example.com',
        role: 'CORPORATE'
      };
      
      service.storeUser(oldUser);
      service.storeUser(testUser);
      
      expect(service.getUser()).toEqual(testUser);
    });

    it('should clear user information', () => {
      service.storeUser(testUser);
      service.clearUser();
      
      expect(service.getUser()).toBeNull();
    });

    it('should handle invalid JSON in user storage', () => {
      localStorage.setItem('user', 'invalid-json{');
      
      const user = service.getUser();
      expect(user).toBeNull();
    });

    it('should store user with ADMIN role', () => {
      const adminUser: User = {
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN'
      };
      
      service.storeUser(adminUser);
      expect(service.getUser()).toEqual(adminUser);
    });
  });

  describe('Token Validation', () => {
    it('should return false when no token exists', () => {
      expect(service.hasValidToken()).toBe(false);
    });

    it('should return false when token is expired', () => {
      // Create an expired token (exp in the past)
      const expiredToken = createMockToken(Math.floor(Date.now() / 1000) - 3600); // 1 hour ago
      service.storeAccessToken(expiredToken);
      
      expect(service.hasValidToken()).toBe(false);
    });

    it('should return true when token is valid and not expired', () => {
      // Create a valid token (exp in the future)
      const validToken = createMockToken(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
      service.storeAccessToken(validToken);
      
      expect(service.hasValidToken()).toBe(true);
    });

    it('should return false when token is about to expire (within buffer)', () => {
      // Create a token that expires in 15 seconds (within 30-second buffer)
      const almostExpiredToken = createMockToken(Math.floor(Date.now() / 1000) + 15);
      service.storeAccessToken(almostExpiredToken);
      
      expect(service.hasValidToken()).toBe(false);
    });

    it('should return true when token expires beyond buffer time', () => {
      // Create a token that expires in 60 seconds (beyond 30-second buffer)
      const validToken = createMockToken(Math.floor(Date.now() / 1000) + 60);
      service.storeAccessToken(validToken);
      
      expect(service.hasValidToken()).toBe(true);
    });
  });

  describe('Token Expiration Checking', () => {
    it('should detect expired token', () => {
      const expiredToken = createMockToken(Math.floor(Date.now() / 1000) - 3600);
      
      expect(service.isTokenExpired(expiredToken)).toBe(true);
    });

    it('should detect valid token', () => {
      const validToken = createMockToken(Math.floor(Date.now() / 1000) + 3600);
      
      expect(service.isTokenExpired(validToken)).toBe(false);
    });

    it('should return true for malformed token', () => {
      const malformedToken = 'not.a.valid.jwt';
      
      expect(service.isTokenExpired(malformedToken)).toBe(true);
    });

    it('should return true for token without exp claim', () => {
      const tokenWithoutExp = createMockTokenWithoutExp();
      
      expect(service.isTokenExpired(tokenWithoutExp)).toBe(true);
    });

    it('should return true for empty token', () => {
      expect(service.isTokenExpired('')).toBe(true);
    });

    it('should return true for token with invalid base64', () => {
      const invalidToken = 'header.!!!invalid-base64!!!.signature';
      
      expect(service.isTokenExpired(invalidToken)).toBe(true);
    });

    it('should handle token with exactly 2 parts', () => {
      const twoPartToken = 'header.payload';
      
      expect(service.isTokenExpired(twoPartToken)).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete authentication flow', () => {
      const accessToken = createMockToken(Math.floor(Date.now() / 1000) + 900); // 15 minutes
      const refreshToken = createMockToken(Math.floor(Date.now() / 1000) + 604800); // 7 days
      const user: User = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'INDIVIDUAL'
      };

      // Store all authentication data
      service.storeAccessToken(accessToken);
      service.storeRefreshToken(refreshToken);
      service.storeUser(user);

      // Verify all data is stored
      expect(service.getAccessToken()).toBe(accessToken);
      expect(service.getRefreshToken()).toBe(refreshToken);
      expect(service.getUser()).toEqual(user);
      expect(service.hasValidToken()).toBe(true);
    });

    it('should handle complete logout flow', () => {
      const accessToken = createMockToken(Math.floor(Date.now() / 1000) + 900);
      const refreshToken = createMockToken(Math.floor(Date.now() / 1000) + 604800);
      const user: User = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'INDIVIDUAL'
      };

      // Store all authentication data
      service.storeAccessToken(accessToken);
      service.storeRefreshToken(refreshToken);
      service.storeUser(user);

      // Clear all data
      service.clearTokens();
      service.clearUser();

      // Verify all data is cleared
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.getUser()).toBeNull();
      expect(service.hasValidToken()).toBe(false);
    });

    it('should handle token refresh scenario', () => {
      const oldAccessToken = createMockToken(Math.floor(Date.now() / 1000) - 100); // expired
      const newAccessToken = createMockToken(Math.floor(Date.now() / 1000) + 900); // valid
      const refreshToken = createMockToken(Math.floor(Date.now() / 1000) + 604800);

      // Store initial tokens
      service.storeAccessToken(oldAccessToken);
      service.storeRefreshToken(refreshToken);

      // Verify old token is expired
      expect(service.hasValidToken()).toBe(false);

      // Simulate token refresh
      service.storeAccessToken(newAccessToken);

      // Verify new token is valid
      expect(service.hasValidToken()).toBe(true);
      expect(service.getRefreshToken()).toBe(refreshToken); // Refresh token unchanged
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

/**
 * Helper function to create a mock JWT token without exp claim
 * @returns Mock JWT token string without expiration
 */
function createMockTokenWithoutExp(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    sub: 'test-user',
    iat: Math.floor(Date.now() / 1000)
  }));
  const signature = 'mock-signature';
  
  return `${header}.${payload}.${signature}`;
}
