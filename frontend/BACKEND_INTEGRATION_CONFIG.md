# Backend-Frontend Integration Configuration

This document describes the configuration setup for integrating the Angular frontend with the Spring Boot backend.

## Environment Configuration

### Development Environment
**File**: `src/environments/environment.ts`

```typescript
{
  production: false,
  apiUrl: 'http://localhost:8080/api',
  tokenExpiration: 900000,  // 15 minutes
  cacheTimeout: {
    categories: 300000,     // 5 minutes
    products: 120000        // 2 minutes
  }
}
```

### Production Environment
**File**: `src/environments/environment.prod.ts`

```typescript
{
  production: true,
  apiUrl: 'https://api.production.com/api',  // Update with actual production URL
  tokenExpiration: 900000,  // 15 minutes
  cacheTimeout: {
    categories: 300000,     // 5 minutes
    products: 120000        // 2 minutes
  }
}
```

## TypeScript Configuration

### Strict Mode Settings
The project uses TypeScript strict mode with the following compiler options enabled in `tsconfig.json`:

- ✅ `strict: true` - Enables all strict type checking options
- ✅ `noImplicitOverride: true` - Ensures override keyword is used
- ✅ `noPropertyAccessFromIndexSignature: true` - Requires explicit property access
- ✅ `noImplicitReturns: true` - Ensures all code paths return a value
- ✅ `noFallthroughCasesInSwitch: true` - Prevents fallthrough in switch statements
- ✅ `strictInjectionParameters: true` - Angular strict DI
- ✅ `strictInputAccessModifiers: true` - Angular strict input access
- ✅ `strictTemplates: true` - Angular strict template checking

These settings ensure:
- Type safety across all API requests and responses
- Early detection of potential runtime errors
- Better IDE support and autocomplete
- Compliance with Angular best practices

## Project Structure

```
frontend/src/
├── environments/
│   ├── environment.ts          # Development configuration
│   └── environment.prod.ts     # Production configuration
└── app/
    └── core/
        ├── guards/             # Route guards (AuthGuard)
        ├── interceptors/       # HTTP interceptors (Auth, Error, Loading)
        ├── models/             # TypeScript interfaces for DTOs
        └── services/           # API services and state management
```

## Backend API Configuration

### Backend Server
- **URL**: http://localhost:8080
- **API Base Path**: /api
- **Port**: 8080

### API Endpoints
All API endpoints are prefixed with `/api`:
- Authentication: `/api/auth/*`
- Products: `/api/products/*`
- Categories: `/api/categories`
- Orders: `/api/orders/*`
- Reviews: `/api/reviews/*`

### CORS Configuration
The backend is configured to accept requests from:
- Development: http://localhost:4200
- Production: (to be configured)

## Usage

### Accessing Environment Variables

```typescript
import { environment } from '../environments/environment';

// Use in services
constructor(private http: HttpClient) {
  this.apiUrl = environment.apiUrl;
}

// Make API calls
this.http.get(`${environment.apiUrl}/products`);
```

### Building for Different Environments

```bash
# Development build (uses environment.ts)
ng build

# Production build (uses environment.prod.ts)
ng build --configuration production
```

## Next Steps

1. ✅ Environment configuration files created
2. ✅ TypeScript strict mode verified
3. ✅ Directory structure verified
4. ⏳ Create TypeScript models for DTOs (Task 2)
5. ⏳ Implement core infrastructure services (Task 3)
6. ⏳ Implement HTTP interceptors (Task 6)
7. ⏳ Implement domain services (Tasks 10-13)

## Requirements Satisfied

This configuration satisfies the following requirements:
- **Requirement 1.3**: API_Base_URL configured as environment variable
- **Requirement 13.1**: Environment files defined with API_Base_URL
- **Requirement 13.2**: Services use environment.apiUrl
- **Requirement 13.3**: Development environment uses http://localhost:8080/api
- **Requirement 15.3**: TypeScript strict mode enabled in tsconfig.json

## Notes

- The production API URL in `environment.prod.ts` is a placeholder and should be updated with the actual production backend URL before deployment
- All services should import and use the environment configuration rather than hardcoding URLs
- The cache timeout values can be adjusted based on data volatility and performance requirements
- Token expiration is set to 15 minutes to match the backend JWT configuration
