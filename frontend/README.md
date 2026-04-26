# CHRONOS Frontend

Angular 21 single-page application for the CHRONOS luxury watch e-commerce platform.

## Prerequisites

- Node.js 20+
- npm 11+
- Angular CLI (`npm install -g @angular/cli`)
- Backend running on `http://localhost:8080` (see `../backend`)

## Environment Configuration

API base URL and cache settings are in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',   // Backend API base URL
  tokenExpiration: 900000,               // JWT access token TTL (15 min, ms)
  cacheTimeout: {
    categories: 300000,                  // Category cache TTL (5 min, ms)
    products: 120000,                    // Product cache TTL (2 min, ms)
  }
};
```

For production, update `src/environments/environment.prod.ts` with the live API URL.

## Running with Backend

1. Start the Spring Boot backend (port 8080).
2. Start the Angular dev server:

```bash
npm start
# or
ng serve
```

Open `http://localhost:4200/` in your browser. Hot-reload is enabled.

## Architecture

```
src/app/
├── core/
│   ├── guards/         # AuthGuard, RoleGuard
│   ├── interceptors/   # AuthInterceptor, ErrorInterceptor, LoadingInterceptor
│   ├── models/         # TypeScript interfaces matching backend DTOs
│   └── services/       # AuthService, ProductService, CategoryService,
│                       # OrderService, ReviewService, TokenStorageService,
│                       # LoadingService, ErrorHandlerService
├── features/           # Page components (home, collection, product-detail, …)
└── shared/             # Navbar, Footer, LoadingIndicator, ErrorToast, directives
```

### Service Layer

| Service | Endpoint | Cache |
|---------|----------|-------|
| `AuthService` | `/api/auth/*` | — |
| `ProductService` | `/api/products` | 2 min per product |
| `CategoryService` | `/api/categories` | 5 min |
| `OrderService` | `/api/orders` | — |
| `ReviewService` | `/api/reviews` | — |

### HTTP Interceptors (order: Loading → Auth → Error)

- **LoadingInterceptor** — tracks requests, drives the global loading bar
- **AuthInterceptor** — injects `Authorization: Bearer <token>`, handles 401 → token refresh, GET retry (max 2, exponential backoff)
- **ErrorInterceptor** — maps HTTP errors to user-friendly messages, drives the error toast

### Authentication Flow

1. User logs in → `AuthService.login()` → tokens stored via `TokenStorageService`
2. Subsequent requests → `AuthInterceptor` adds `Authorization` header
3. On 401 → refresh attempted → original request retried
4. On refresh failure → logout → redirect to `/login`
5. Protected routes use `authGuard` / `roleGuard`; attempted URL is stored and restored after login

## Building

```bash
ng build                    # Development build
ng build --configuration production  # Production build
```

Output in `dist/frontend/`.

## Running Unit Tests

Tests use **Vitest** with jsdom environment:

```bash
ng test
```

Test files follow the `*.spec.ts` convention and cover:
- All core services (Auth, Token, Loading, Error, Product, Category, Order, Review)
- HTTP interceptors (Auth, Error, Loading)
- Route guards (AuthGuard, RoleGuard)
- Shared components (LoadingIndicator, ErrorToast)

## Additional Resources

- [Angular CLI Reference](https://angular.dev/tools/cli)
- [Vitest](https://vitest.dev/)
