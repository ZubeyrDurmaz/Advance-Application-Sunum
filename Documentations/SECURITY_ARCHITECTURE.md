# CHRONOS Security Architecture & Implementation Guide

This document outlines the comprehensive security measures, protocols, and architectural decisions implemented in the CHRONOS E-Commerce Platform to protect user data, secure transactions, and prevent unauthorized access.

---

## 1. Security Philosophy & Core Principles

CHRONOS adopts a **"Zero Trust"** architecture. 
- No request is inherently trusted, even if it originates from within the network.
- The backend operates entirely on a **Stateless** model. The server does not maintain user sessions in memory (No `JSESSIONID`), meaning every single request must cryptographically prove its identity and authorization.
- Security is applied in layers: Network (CORS), Application (Spring Security Filters), and Business Logic (Role Checks).

---

## 2. Authentication: The Dual-Token JWT System

CHRONOS abandons traditional cookie-based sessions in favor of a modern **JSON Web Token (JWT)** architecture utilizing the `io.jsonwebtoken` library.

### 2.1. Access Tokens vs. Refresh Tokens
When a user successfully logs in via `/api/auth/login`, the backend issues two distinct tokens:
1. **Access Token:** 
   - **Lifespan:** Very short (e.g., 15 minutes).
   - **Purpose:** Sent in the `Authorization: Bearer <token>` header of every API request.
   - **Contents:** Contains the user's email (`sub`) and their role claim (`ROLE_ADMIN`).
2. **Refresh Token:**
   - **Lifespan:** Long (e.g., 7 days).
   - **Purpose:** Stored securely in the database and the client. When the Access Token expires, the frontend silently sends the Refresh Token to `/api/auth/refresh` to obtain a fresh Access Token without forcing the user to log in again.

### 2.2. Threat Mitigation
- **XSS (Cross-Site Scripting):** Because Access Tokens are extremely short-lived, an attacker who steals one via XSS only has a tiny window of opportunity before it becomes useless.
- **CSRF (Cross-Site Request Forgery):** By using HTTP Headers (`Authorization: Bearer`) instead of cookies, the application is naturally immune to CSRF attacks. Therefore, CSRF protection is explicitly disabled in `SecurityConfig.java`.

---

## 3. Cryptography & Password Management

Passwords are **never** stored in plain text.

### 3.1. BCrypt Hashing Algorithm
CHRONOS utilizes Spring Security's `BCryptPasswordEncoder`. 
- Every password (e.g., `Chronos2024!`) is salted and hashed using the BCrypt algorithm before being saved to the PostgreSQL database.
- Even if the database is completely compromised, attackers cannot reverse-engineer the hashes to retrieve the original passwords due to the computational cost of BCrypt.

---

## 4. Role-Based Access Control (RBAC)

The platform enforces strict authorization boundaries using three distinct user roles defined in the `Role` enum.

### 4.1. The Role Hierarchy
- **`ROLE_INDIVIDUAL`**: Standard buyers. Can view the catalog, manage their own addresses/payment methods, and place orders.
- **`ROLE_CORPORATE`**: Store owners. Can manage their specific store's inventory and view their store's orders. Cannot modify global settings.
- **`ROLE_ADMIN`**: System administrators. Can ban users, approve stores, create global discount codes, and view audit logs.

### 4.2. Enforcement Mechanisms
1. **URL-Level Security (`SecurityConfig`):**
   ```java
   .requestMatchers("/api/admin/**").hasRole("ADMIN")
   .requestMatchers("/api/corporate/**").hasRole("CORPORATE")
   ```
   If a `CORPORATE` user attempts to hit `/api/admin/logs`, the Spring `SecurityFilterChain` immediately intercepts the request and returns `403 Forbidden` before it ever reaches the Controller.

2. **Method-Level Security:**
   Using annotations like `@PreAuthorize("hasRole('ADMIN')")` directly on controller methods for granular control.

---

## 5. The Gatekeeper: `JwtAuthFilter`

The `JwtAuthFilter` extends `OncePerRequestFilter` and is the backbone of the stateless security model.

**Execution Flow for Every Request:**
1. Intercepts the incoming HTTP request.
2. Checks for the `Authorization` header. If missing, allows the request to proceed (it will be blocked later if the route requires authentication).
3. If present, it extracts the token and uses the highly secure, secret signing key to verify the digital signature.
4. If the signature is valid and not expired, it extracts the user's identity.
5. It loads the `UserDetails` and injects an `UsernamePasswordAuthenticationToken` into the `SecurityContextHolder`.
6. The request is now authenticated for that specific thread execution. Once the response is sent, the thread is cleared.

---

## 6. Data Privacy & Tokenization (Payment Methods)

Handling financial data requires extreme care to comply with PCI-DSS concepts.

- **Tokenization:** CHRONOS does not store raw credit card numbers. When a user adds a payment method, the frontend (ideally via a provider like Stripe) sends a `cardToken`.
- **Data Masking:** Only the `lastFour` digits (e.g., `1234`) and the expiry date are stored for display purposes.
- **API Boundaries:** The `UserPaymentMethodResponse` DTO explicitly **excludes** the `cardToken` field. Even if an endpoint is compromised, the API will never transmit the raw token back to the frontend.

---

## 7. Platform Accountability: Audit Logging

Security isn't just about preventing attacks; it's about tracking them.

CHRONOS features an `AuditLog` entity and service.
- **Critical Action Tracking:** Whenever a sensitive action occurs (e.g., an Admin changes a user's role, or a Store is approved), an immutable log is written to the database.
- **Data Points:** Logs capture the `actionType`, the `actorId` (who did it), the `targetId` (who was affected), and the exact `timestamp`.
- **Exporting:** Admins can securely export these logs via CSV (`/api/admin/logs/csv`) for external compliance and forensic audits.

---

## 8. Conclusion

By combining **Stateless JWTs**, **BCrypt Hashing**, **Strict RBAC via Spring Security**, and **Immutable Audit Logging**, the CHRONOS platform presents a highly fortified surface area capable of defending against modern web vulnerabilities (OWASP Top 10) while maintaining blazing-fast performance.
