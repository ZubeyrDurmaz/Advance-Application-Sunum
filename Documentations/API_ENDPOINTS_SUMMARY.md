# CHRONOS Comprehensive API Endpoints Summary

This document provides a comprehensive overview of all RESTful API endpoints available in the CHRONOS platform, categorized by their domain and required security roles.

All authenticated endpoints require the `Authorization: Bearer <token>` header.

---

## 1. Authentication Endpoints (`/api/auth`)
**Security Level:** Public (No Token Required)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/auth/signup` | Register a new user | `SignupRequest` |
| `POST` | `/api/auth/login` | Authenticate user & receive tokens | `LoginRequest` |
| `POST` | `/api/auth/refresh` | Refresh an expired access token | `RefreshTokenRequest` |
| `POST` | `/api/auth/logout` | Invalidate current session tokens | - |

---

## 2. Public Catalog Endpoints (`/api/public`)
**Security Level:** Public

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET`  | `/api/public/products` | Get paginated list of products | `page, size, category, minPrice, maxPrice` |
| `GET`  | `/api/public/products/{slug}`| Get detailed product by SKU/Slug| - |
| `GET`  | `/api/public/categories` | Get all product categories | - |
| `GET`  | `/api/public/stores` | Get all active luxury boutiques | - |
| `GET`  | `/api/public/reviews/{productId}`| Get reviews for a specific product| - |

---

## 3. User Management Endpoints (`/api/users`)
**Security Level:** Authenticated (Any Role)

### Profile
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET`  | `/api/users/me` | Get current user's profile | - |
| `PUT`  | `/api/users/me` | Update current user's profile | `UserProfileUpdateRequest` |

### Addresses
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET`  | `/api/users/me/addresses` | List user's saved addresses | - |
| `POST` | `/api/users/me/addresses` | Add a new address | `UserAddressRequest` |
| `GET`  | `/api/users/me/addresses/{id}`| Get specific address | - |
| `PUT`  | `/api/users/me/addresses/{id}`| Update specific address | `UserAddressRequest` |
| `DELETE`| `/api/users/me/addresses/{id}`| Delete specific address | - |
| `PUT`  | `/api/users/me/addresses/{id}/set-default`| Set address as default | - |

### Payment Methods
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET`  | `/api/users/me/payment-methods` | List saved payment methods | - |
| `POST` | `/api/users/me/payment-methods` | Add new tokenized card | `UserPaymentMethodRequest` |
| `DELETE`| `/api/users/me/payment-methods/{id}`| Remove payment method | - |
| `PUT`  | `/api/users/me/payment-methods/{id}/set-default`| Set card as default | - |

---

## 4. Order & Checkout Endpoints (`/api/orders`)
**Security Level:** Authenticated (Any Role)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/orders/checkout` | Process a new order transaction | `CheckoutRequest` |
| `GET`  | `/api/orders/history` | Get user's past orders | - |
| `GET`  | `/api/orders/{id}` | Get specific order details | - |
| `POST` | `/api/orders/{id}/cancel`| Cancel a pending order | - |

---

## 5. Review Endpoints (`/api/reviews`)
**Security Level:** Authenticated (Any Role)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/reviews` | Submit a review for a purchased product | `ReviewRequest` |
| `DELETE`| `/api/reviews/{id}` | Delete a review (User owns or Admin) | - |

---

## 6. Corporate (Seller) Endpoints (`/api/corporate`)
**Security Level:** Authenticated (`ROLE_CORPORATE` Only)

### Inventory Management
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET`  | `/api/corporate/products` | Get store's product inventory | - |
| `POST` | `/api/corporate/products` | Add new product to store | `ProductRequest` |
| `PUT`  | `/api/corporate/products/{id}`| Update product details/price | `ProductRequest` |
| `PATCH`| `/api/corporate/products/{id}/stock`| Update product stock quantity | `StockUpdateRequest` |
| `DELETE`| `/api/corporate/products/{id}`| Remove product from catalog | - |

### Order Management
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET`  | `/api/corporate/orders` | Get orders placed at the store | - |
| `PATCH`| `/api/corporate/orders/{id}/status`| Update order status (e.g., SHIPPED) | `OrderStatusRequest` |

---

## 7. Admin Endpoints (`/api/admin`)
**Security Level:** Authenticated (`ROLE_ADMIN` Only)

### Entity Management
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET`  | `/api/admin/users` | List all platform users | - |
| `PUT`  | `/api/admin/users/{id}/role` | Change a user's role | `RoleUpdateRequest` |
| `GET`  | `/api/admin/stores` | List all boutique stores | - |
| `PUT`  | `/api/admin/stores/{id}/status`| Approve/Reject a store | `StoreStatusRequest` |
| `GET`  | `/api/admin/products` | List all products across platform | - |
| `DELETE`| `/api/admin/products/{id}` | Force delete any product | - |

### Discount Codes
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET`  | `/api/admin/discounts` | List all global discount codes | - |
| `POST` | `/api/admin/discounts` | Create a new discount code | `DiscountCodeRequest` |
| `DELETE`| `/api/admin/discounts/{id}` | Deactivate a discount code | - |

### Audit & Reporting
| Method | Endpoint | Description | Return Type |
|--------|----------|-------------|-------------|
| `GET`  | `/api/admin/logs` | View paginated system audit logs | JSON |
| `GET`  | `/api/admin/logs/csv` | Download audit logs as CSV file | `text/csv` blob |
| `GET`  | `/api/admin/analytics` | Get high-level platform statistics | JSON |

---

## Error Handling Standards

All endpoints utilize a centralized `@RestControllerAdvice` to return a standardized error object when something fails:

```json
{
  "timestamp": "2026-04-26T20:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Product with ID '123' not found.",
  "path": "/api/public/products/123"
}
```

Common HTTP Status Codes:
- `200 OK`: Successful read/update
- `201 Created`: Successfully created resource
- `400 Bad Request`: Invalid input or business logic violation
- `401 Unauthorized`: Missing or expired JWT Token
- `403 Forbidden`: User lacks the required role (e.g., User accessing Corporate endpoint)
- `404 Not Found`: Resource does not exist