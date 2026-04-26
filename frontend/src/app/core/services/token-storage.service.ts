import { Injectable } from '@angular/core';
import { User } from '../models/auth.model';

/**
 * TokenStorageService
 * 
 * Manages JWT tokens and user information in browser storage.
 * Provides methods for storing, retrieving, and validating authentication tokens.
 * 
 * Storage Strategy:
 * - Uses localStorage for persistent sessions
 * - Stores tokens as plain strings
 * - Stores user object as JSON
 * 
 * @example
 * ```typescript
 * // Store tokens after login
 * tokenStorage.storeAccessToken(response.accessToken);
 * tokenStorage.storeRefreshToken(response.refreshToken);
 * tokenStorage.storeUser({ name: 'John', email: 'john@example.com', role: 'INDIVIDUAL' });
 * 
 * // Check authentication
 * if (tokenStorage.hasValidToken()) {
 *   const user = tokenStorage.getUser();
 * }
 * 
 * // Clear on logout
 * tokenStorage.clearTokens();
 * tokenStorage.clearUser();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';
  private readonly REDIRECT_URL_KEY = 'redirect_url';

  constructor() { }

  /**
   * Store access token in localStorage
   * @param token JWT access token
   */
  storeAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  /**
   * Retrieve access token from localStorage
   * @returns Access token or null if not found
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Store refresh token in localStorage
   * @param token JWT refresh token
   */
  storeRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Retrieve refresh token from localStorage
   * @returns Refresh token or null if not found
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Clear both access and refresh tokens from localStorage
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Store user information in localStorage
   * @param user User object containing name, email, and role
   */
  storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Retrieve user information from localStorage
   * @returns User object or null if not found or invalid JSON
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) {
      return null;
    }
    
    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear user information from localStorage
   */
  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if a valid access token exists
   * @returns true if access token exists and is not expired, false otherwise
   */
  hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }
    
    return !this.isTokenExpired(token);
  }

  /**
   * Check if a JWT token is expired
   * @param token JWT token to check
   * @returns true if token is expired or invalid, false otherwise
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return true;
      }
      
      // JWT exp is in seconds, Date.now() is in milliseconds
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      // Add a 30-second buffer to account for clock skew
      const bufferTime = 30 * 1000;
      
      return currentTime >= (expirationTime - bufferTime);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return true;
    }
  }

  storeRedirectUrl(url: string): void {
    localStorage.setItem(this.REDIRECT_URL_KEY, url);
  }

  getRedirectUrl(): string | null {
    return localStorage.getItem(this.REDIRECT_URL_KEY);
  }

  clearRedirectUrl(): void {
    localStorage.removeItem(this.REDIRECT_URL_KEY);
  }

  /**
   * Decode JWT token payload
   * @param token JWT token
   * @returns Decoded payload or null if invalid
   */
  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return null;
    }
  }
}
