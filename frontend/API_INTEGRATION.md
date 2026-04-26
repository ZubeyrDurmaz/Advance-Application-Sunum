# API Integration Reference

Complete reference for all backend endpoints consumed by the Angular frontend.

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8080/api` |
| Production  | Set in `src/environments/environment.prod.ts` |

---

## Authentication (`/api/auth`)

### POST `/api/auth/login`
Login with email + password.

**Request:** `LoginRequest { email, password }`  
**Response:** `AuthResponse { accessToken, refreshToken, name, email, role }`  
**Auth required:** No  
**Service:** `AuthService.login()`

---

### POST `/api/auth/signup`
Register a new user.

**Request:** `SignupRequest { name, email, password, role? }`  
**Response:** `AuthResponse`  
**Auth required:** No  
**Service:** `AuthService.signup()`

---

### POST `/api/auth/refresh`
Refresh an expired access token.

**Request:** `TokenRefreshRequest { refreshToken }`  
**Response:** `AuthResponse`  
**Auth required:** No  
**Service:** `AuthService.refreshToken()` — also called automatically by `AuthInterceptor` on 401

---

### POST `/api/auth/logout`
Invalidate the current session.

**Request:** _(empty)_  
**Auth required:** Yes (`Authorization: Bearer <token>`)  
**Service:** `AuthService.logout()`

---

### GET `/api/auth/me`
Retrieve current user profile.

**Response:** `AuthResponse`  
**Auth required:** Yes  
**Service:** `AuthService.getUserProfile()`

---

## Products (`/api/products`)

### GET `/api/products`
List all products.

**Response:** `ProductResponse[]`  
**Auth required:** No  
**Service:** `ProductService.getAllProducts()`

---

### GET `/api/products?search={query}`
Search products by name/description. Debounced 300ms at component level.

**Response:** `ProductResponse[]`  
**Auth required:** No  
**Service:** `ProductService.searchProducts(query)`

---

### GET `/api/products?categoryId={id}`
Filter products by category.

**Response:** `ProductResponse[]`  
**Auth required:** No  
**Service:** `ProductService.getProductsByCategory(id)`

---

### GET `/api/products?page={page}&size={size}`
Paginated product list.

**Response:** `PaginatedResponse<ProductResponse> { content, totalElements, totalPages, currentPage, size }`  
**Auth required:** No  
**Service:** `ProductService.getProductsPaginated(page, size)`

---

### GET `/api/products/{id}`
Get product by UUID. Cached for 2 minutes.

**Response:** `ProductResponse`  
**Auth required:** No  
**Service:** `ProductService.getProductById(id)`

---

### GET `/api/products/sku/{sku}`
Get product by SKU.

**Response:** `ProductResponse`  
**Auth required:** No  
**Service:** `ProductService.getProductBySku(sku)`

---

## Categories (`/api/categories`)

### GET `/api/categories`
List all categories. Cached for 5 minutes.

**Response:** `Category[] { id, name }`  
**Auth required:** No  
**Service:** `CategoryService.getAllCategories()`

---

## Orders (`/api/orders`)

### GET `/api/orders`
Get current user's order history.

**Response:** `OrderResponse[]`  
**Auth required:** Yes  
**Service:** `OrderService.getUserOrders()`

---

### GET `/api/orders/{id}`
Get a specific order by UUID.

**Response:** `OrderResponse { id, status, grandTotal, orderDate, paymentMethod, storeName, items[] }`  
**Auth required:** Yes  
**Service:** `OrderService.getOrderById(id)`

---

## Reviews (`/api/reviews`)

### GET `/api/reviews/product/{productId}`
Get reviews for a product.

**Response:** `ReviewResponse[] { id, userName, productName, starRating, sentiment, createdAt }`  
**Auth required:** No  
**Service:** `ReviewService.getProductReviews(productId)`

---

### POST `/api/reviews/product/{productId}`
Submit a review (authenticated users only).

**Request:** `ReviewRequest { starRating: number, sentiment: string }`  
**Response:** `ReviewResponse`  
**Auth required:** Yes  
**Service:** `ReviewService.submitReview(productId, review)`

---

## Error Handling

| HTTP Status | User Message | Action |
|-------------|-------------|--------|
| 0 (network) | Network error, check your connection | Toast notification |
| 400 | Validation error message from body | Toast notification |
| 401 | Authentication required | AuthInterceptor triggers token refresh |
| 403 | Access denied | Toast notification |
| 404 | Resource not found | Toast notification |
| 500 | Server error, please try again later | Toast notification |

All errors are logged to the browser console with request details.

## Caching

| Data | TTL | Invalidation |
|------|-----|-------------|
| Category list | 5 min | `CategoryService.clearCache()` |
| Product by ID | 2 min | `ProductService.clearCache()` |

## Retry Logic

Failed GET requests are retried up to **2 times** with exponential backoff (1s, 2s):
- **Retried:** network errors (status 0), 5xx errors
- **Not retried:** 4xx errors (except 401), POST/PUT/DELETE requests
