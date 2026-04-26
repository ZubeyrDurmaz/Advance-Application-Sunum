/**
 * Authentication Models
 * 
 * TypeScript interfaces for authentication-related DTOs that match the backend API structure.
 * These models are used for type-safe communication with the Spring Boot backend.
 */

/**
 * Login request payload
 * Used for POST /api/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Signup request payload
 * Used for POST /api/auth/signup
 */
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: 'INDIVIDUAL' | 'CORPORATE';
}

/**
 * Token refresh request payload
 * Used for POST /api/auth/refresh
 */
export interface TokenRefreshRequest {
  refreshToken: string;
}

/**
 * Authentication response
 * Returned from login, signup, and token refresh endpoints
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  name: string;
  email: string;
  role: string;
}

/**
 * User model
 * Represents the authenticated user's information
 */
export interface User {
  name: string;
  email: string;
  role: 'INDIVIDUAL' | 'CORPORATE' | 'ADMIN';
}
