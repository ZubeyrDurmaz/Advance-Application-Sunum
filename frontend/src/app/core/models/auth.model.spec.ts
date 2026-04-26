import { LoginRequest, SignupRequest, TokenRefreshRequest, AuthResponse, User } from './auth.model';
import { describe, it, expect } from 'vitest';

describe('Authentication Models', () => {
  describe('LoginRequest', () => {
    it('should create a valid LoginRequest object', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      expect(loginRequest.email).toBe('test@example.com');
      expect(loginRequest.password).toBe('password123');
    });
  });

  describe('SignupRequest', () => {
    it('should create a valid SignupRequest object with role', () => {
      const signupRequest: SignupRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'INDIVIDUAL'
      };

      expect(signupRequest.name).toBe('John Doe');
      expect(signupRequest.email).toBe('john@example.com');
      expect(signupRequest.password).toBe('password123');
      expect(signupRequest.role).toBe('INDIVIDUAL');
    });

    it('should create a valid SignupRequest object without role', () => {
      const signupRequest: SignupRequest = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      };

      expect(signupRequest.name).toBe('Jane Doe');
      expect(signupRequest.email).toBe('jane@example.com');
      expect(signupRequest.password).toBe('password123');
      expect(signupRequest.role).toBeUndefined();
    });
  });

  describe('TokenRefreshRequest', () => {
    it('should create a valid TokenRefreshRequest object', () => {
      const tokenRefreshRequest: TokenRefreshRequest = {
        refreshToken: 'refresh-token-123'
      };

      expect(tokenRefreshRequest.refreshToken).toBe('refresh-token-123');
    });
  });

  describe('AuthResponse', () => {
    it('should create a valid AuthResponse object', () => {
      const authResponse: AuthResponse = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'INDIVIDUAL'
      };

      expect(authResponse.accessToken).toBe('access-token-123');
      expect(authResponse.refreshToken).toBe('refresh-token-123');
      expect(authResponse.name).toBe('John Doe');
      expect(authResponse.email).toBe('john@example.com');
      expect(authResponse.role).toBe('INDIVIDUAL');
    });
  });

  describe('User', () => {
    it('should create a valid User object with INDIVIDUAL role', () => {
      const user: User = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'INDIVIDUAL'
      };

      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe('INDIVIDUAL');
    });

    it('should create a valid User object with CORPORATE role', () => {
      const user: User = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'CORPORATE'
      };

      expect(user.name).toBe('Jane Doe');
      expect(user.email).toBe('jane@example.com');
      expect(user.role).toBe('CORPORATE');
    });

    it('should create a valid User object with ADMIN role', () => {
      const user: User = {
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN'
      };

      expect(user.name).toBe('Admin User');
      expect(user.email).toBe('admin@example.com');
      expect(user.role).toBe('ADMIN');
    });
  });
});
