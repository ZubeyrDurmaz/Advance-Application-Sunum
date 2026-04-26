# Core Module

This directory contains the core infrastructure for backend-frontend integration.

## Directory Structure

```
core/
├── guards/          # Route guards for authentication and authorization
├── interceptors/    # HTTP interceptors for token management, error handling, and loading state
├── models/          # TypeScript interfaces for API request/response DTOs
└── services/        # Core services for API communication and state management
```

## Services

- **AuthService**: Handles user authentication (login, signup, logout, token refresh)
- **TokenStorageService**: Manages JWT token storage and retrieval
- **ErrorHandlerService**: Centralized HTTP error handling
- **LoadingService**: Global loading state management
- **ProductService**: Product catalog operations
- **CategoryService**: Category management
- **OrderService**: Order history and details
- **ReviewService**: Product review operations

## Models

TypeScript interfaces matching backend DTOs:
- **auth.model.ts**: Authentication-related models (LoginRequest, SignupRequest, AuthResponse, User)
- **product.model.ts**: Product-related models (ProductResponse, Category, PaginatedResponse)
- **order.model.ts**: Order-related models (OrderResponse, OrderItemResponse)
- **review.model.ts**: Review-related models (ReviewResponse, ReviewRequest)

## Interceptors

- **AuthInterceptor**: Injects JWT tokens into requests and handles token refresh
- **ErrorInterceptor**: Intercepts HTTP errors and delegates to ErrorHandlerService
- **LoadingInterceptor**: Tracks request lifecycle and updates LoadingService

## Guards

- **AuthGuard**: Protects routes requiring authentication

## Environment Configuration

Environment-specific settings are defined in:
- `src/environments/environment.ts` - Development configuration
- `src/environments/environment.prod.ts` - Production configuration

### Environment Variables

- `apiUrl`: Base URL for backend API endpoints
- `tokenExpiration`: JWT token expiration time in milliseconds
- `cacheTimeout`: Cache durations for different data types

## Usage

All services use Angular's dependency injection system and return RxJS Observables for reactive programming.

Example:
```typescript
import { AuthService } from './core/services/auth.service';

constructor(private authService: AuthService) {}

login() {
  this.authService.login({ email: 'user@example.com', password: 'password' })
    .subscribe({
      next: (response) => console.log('Login successful', response),
      error: (error) => console.error('Login failed', error)
    });
}
```
