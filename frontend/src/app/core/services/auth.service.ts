import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { User, AuthResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

/**
 * AuthService
 * 
 * Manages user authentication state and operations.
 * Provides reactive authentication state through Observables.
 * 
 * State Management:
 * - Uses BehaviorSubject for authentication state (isAuthenticated, user, loading, error)
 * - Exposes isAuthenticated$ and currentUser$ Observables for components to subscribe
 * 
 * Dependencies:
 * - HttpClient: For making HTTP requests to backend auth endpoints
 * - TokenStorageService: For storing and retrieving JWT tokens
 * - Router: For navigation after authentication operations
 * 
 * @example
 * ```typescript
 * // Subscribe to authentication state
 * authService.isAuthenticated$.subscribe(isAuth => {
 *   console.log('User authenticated:', isAuth);
 * });
 * 
 * // Subscribe to current user
 * authService.currentUser$.subscribe(user => {
 *   console.log('Current user:', user);
 * });
 * 
 * // Login
 * authService.login('user@example.com', 'password').subscribe({
 *   next: (response) => console.log('Login successful'),
 *   error: (error) => console.error('Login failed', error)
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;

  // Authentication state management using BehaviorSubject
  private authStateSubject = new BehaviorSubject<{
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: string | null;
  }>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  });

  // Public Observables for components to subscribe to authentication state
  public readonly authState$ = this.authStateSubject.asObservable();
  
  /**
   * Observable that emits true when user is authenticated, false otherwise
   */
  public readonly isAuthenticated$: Observable<boolean> = new Observable(observer => {
    this.authState$.subscribe(state => observer.next(state.isAuthenticated));
  });
  
  /**
   * Observable that emits the current user or null if not authenticated
   */
  public readonly currentUser$: Observable<User | null> = new Observable(observer => {
    this.authState$.subscribe(state => observer.next(state.user));
  });

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    // Initialize authentication state from storage on service creation
    this.initializeAuthState();
  }

  /**
   * Initialize authentication state from stored tokens and user data
   * Called on service construction to restore session
   */
  private initializeAuthState(): void {
    const user = this.tokenStorage.getUser();
    const hasValidToken = this.tokenStorage.hasValidToken();
    
    if (user && hasValidToken) {
      this.updateAuthState({
        isAuthenticated: true,
        user: user,
        loading: false,
        error: null
      });
    }
  }

  /**
   * Update the authentication state and emit to subscribers
   * @param updates Partial state updates to apply
   */
  private updateAuthState(updates: Partial<{
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: string | null;
  }>): void {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      ...updates
    });
  }

  // Track ongoing token refresh to prevent multiple simultaneous requests
  private refreshTokenInProgress: Observable<AuthResponse> | null = null;

  /**
   * Login with email and password
   * Sends POST request to /api/auth/login with LoginRequest
   * Stores tokens and user information on success
   * Updates authentication state
   * 
   * @param email User email
   * @param password User password
   * @returns Observable<AuthResponse>
   * 
   * Requirements: 2.1, 2.2, 2.5
   */
  login(email: string, password: string): Observable<AuthResponse> {
    this.updateAuthState({ loading: true, error: null });
    
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password }).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  /**
   * Signup new user
   * Sends POST request to /api/auth/signup with SignupRequest
   * Stores tokens and user information on success
   * Updates authentication state
   * 
   * @param name User name
   * @param email User email
   * @param password User password
   * @param role User role (optional, defaults to INDIVIDUAL)
   * @returns Observable<AuthResponse>
   * 
   * Requirements: 2.3, 2.4, 2.5
   */
  signup(name: string, email: string, password: string, role?: string): Observable<AuthResponse> {
    this.updateAuthState({ loading: true, error: null });
    
    return this.http.post<AuthResponse>(`${this.API_URL}/signup`, { name, email, password, role }).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  /**
   * Refresh access token using refresh token
   * Sends POST request to /api/auth/refresh with TokenRefreshRequest
   * Updates tokens in storage on success
   * Clears tokens and emits unauthenticated state on failure
   * Prevents multiple simultaneous refresh requests by queuing
   * 
   * @returns Observable<AuthResponse>
   * 
   * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
   */
  refreshToken(): Observable<AuthResponse> {
    // If refresh is already in progress, return the existing observable
    if (this.refreshTokenInProgress) {
      return this.refreshTokenInProgress;
    }

    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      // No refresh token available, clear state and emit error
      this.clearAuthenticationState();
      return new Observable(observer => {
        observer.error(new Error('No refresh token available'));
      });
    }

    // Create new refresh request
    this.refreshTokenInProgress = this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      tap({
        next: (res) => {
          // Update tokens in storage on success
          this.tokenStorage.storeAccessToken(res.accessToken);
          this.tokenStorage.storeRefreshToken(res.refreshToken);
          
          // Update user information if provided
          const user: User = {
            name: res.name,
            email: res.email,
            role: res.role as 'INDIVIDUAL' | 'CORPORATE' | 'ADMIN'
          };
          this.tokenStorage.storeUser(user);
          this.updateAuthState({ isAuthenticated: true, user });
          
          // Clear the in-progress flag
          this.refreshTokenInProgress = null;
        },
        error: () => {
          // Clear tokens and emit unauthenticated state on failure
          this.clearAuthenticationState();
          this.refreshTokenInProgress = null;
        }
      })
    );

    return this.refreshTokenInProgress;
  }

  /**
   * Logout current user
   * Sends POST request to /api/auth/logout
   * Clears all tokens from storage
   * Emits unauthenticated state
   * Redirects to login page
   * 
   * @returns Observable<void>
   * 
   * Requirements: 2.6, 16.1, 16.2, 16.3, 16.4
   */
  logout(): Observable<void> {
    return new Observable(observer => {
      const token = this.tokenStorage.getAccessToken();
      
      if (token) {
        // Send POST request to /api/auth/logout
        this.http.post<void>(`${this.API_URL}/logout`, {}).subscribe({
          next: () => {
            this.clearAuthenticationState();
            this.router.navigate(['/login']);
            observer.next();
            observer.complete();
          },
          error: () => {
            // Even if logout request fails, clear local state
            this.clearAuthenticationState();
            this.router.navigate(['/login']);
            observer.next();
            observer.complete();
          }
        });
      } else {
        // No token, just clear state
        this.clearAuthenticationState();
        this.router.navigate(['/login']);
        observer.next();
        observer.complete();
      }
    });
  }

  /**
   * Clear authentication state and storage
   * Helper method to centralize state clearing logic
   */
  private clearAuthenticationState(): void {
    this.tokenStorage.clearTokens();
    this.tokenStorage.clearUser();
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
  }

  /**
   * Handle successful authentication response
   * Stores tokens and user data, updates authentication state
   * @param res AuthResponse from backend
   */
  private handleAuthResponse(res: AuthResponse): void {
    const user: User = { 
      name: res.name, 
      email: res.email, 
      role: res.role as 'INDIVIDUAL' | 'CORPORATE' | 'ADMIN'
    };
    
    // Store tokens and user data
    this.tokenStorage.storeAccessToken(res.accessToken);
    this.tokenStorage.storeRefreshToken(res.refreshToken);
    this.tokenStorage.storeUser(user);
    
    // Update authentication state
    this.updateAuthState({
      isAuthenticated: true,
      user: user,
      loading: false,
      error: null
    });
  }

  /**
   * Get current user from state
   * @returns Current user or null if not authenticated
   */
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Get user profile from backend
   * Sends GET request to /api/auth/me
   * Updates authentication state with user information
   * Handles 401 errors by clearing tokens
   * 
   * @returns Observable<User>
   * 
   * Requirements: 2.5, 11.1, 11.2, 11.3
   */
  getUserProfile(): Observable<User> {
    return this.http.get<AuthResponse>(`${this.API_URL}/me`).pipe(
      tap({
        next: (res) => {
          // Update authentication state with user information
          const user: User = {
            name: res.name,
            email: res.email,
            role: res.role as 'INDIVIDUAL' | 'CORPORATE' | 'ADMIN'
          };
          this.tokenStorage.storeUser(user);
          this.updateAuthState({ isAuthenticated: true, user });
        },
        error: (error) => {
          // Handle 401 errors by clearing tokens
          if (error.status === 401) {
            this.clearAuthenticationState();
          }
        }
      }),
      map((res: AuthResponse) => ({
        name: res.name,
        email: res.email,
        role: res.role as 'INDIVIDUAL' | 'CORPORATE' | 'ADMIN'
      }))
    );
  }

  /**
   * Check if user is authenticated
   * @returns true if user is authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated && this.tokenStorage.hasValidToken();
  }

  /**
   * Get user initials for display
   * @returns User initials (e.g., "JD" for "John Doe")
   */
  initials(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    return user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  /**
   * Check if current user has specific role
   * @param role Role to check
   * @returns true if user has the specified role
   */
  hasRole(role: 'INDIVIDUAL' | 'CORPORATE' | 'ADMIN'): boolean {
    return this.getCurrentUser()?.role === role;
  }

  /**
   * Check if user is logged in (alias for isAuthenticated)
   * @returns true if user is logged in
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Update current user information in storage and state
   * Used after profile updates to keep auth state in sync
   * @param updates Partial user updates to apply
   */
  updateUserInfo(updates: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.tokenStorage.storeUser(updatedUser);
      this.updateAuthState({ user: updatedUser });
    }
  }
}
