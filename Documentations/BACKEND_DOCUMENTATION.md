# CHRONOS Backend Architecture & Technical Documentation

This exhaustive document serves as the definitive, ultimate guide to the backend architecture of the CHRONOS E-Commerce Platform. It covers the technology stack, architectural patterns, security implementations, database strategies, domain modules, and extensive testing strategies in minute detail.

---

## 1. Executive Summary & Tech Stack Overview

The CHRONOS backend is a highly scalable, robust, and secure RESTful API designed to handle the complex business logic of a multi-vendor, multi-role e-commerce platform. It provides the foundation upon which the frontend client operates.

**Core Technology Stack:**
- **Core Framework:** Spring Boot 3.x (Provides auto-configuration, embedded Tomcat server, and production-ready features).
- **Language:** Java 21 (Leveraging modern Java features such as Records, Pattern Matching, and optimized Garbage Collection).
- **Database:** PostgreSQL (A highly stable, open-source relational database system).
- **ORM & Data Access:** Hibernate & Spring Data JPA.
- **Security:** Spring Security 6 coupled with JSON Web Tokens (JWT) via `io.jsonwebtoken` libraries.
- **Testing:** JUnit 5 (Jupiter), Mockito for mocking, and Spring MockMvc for API testing.
- **Build Tool:** Maven (Managing dependencies via `pom.xml`).
- **Boilerplate Reduction:** Lombok (`@Data`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j`).

---

## 2. Global Directory Structure & Code Organization

The application strictly adheres to the standard Maven directory layout, organized by technical concern rather than feature, forming an N-Tier Layered Architecture.

```text
src/main/java/com/example/backend/
├── config/              # Centralized configuration (SecurityConfig, WebConfig, DataSeeder)
├── controller/          # REST API Endpoints representing the presentation tier
├── dto/                 # Data Transfer Objects (Requests/Responses) protecting Entities
├── entity/              # JPA Domain Models mapped directly to PostgreSQL tables
├── exception/           # Global Error Handling, Custom Exceptions, ControllerAdvice
├── repository/          # Spring Data JPA Interfaces for Database CRUD operations
├── security/            # Advanced Security implementations (JWT Filters, UserDetails)
├── service/             # The core Business Logic and Transactional boundaries
└── util/                # Helper utilities (e.g., CsvExportUtil, Date formatters)

src/test/java/com/example/backend/
├── controller/          # MockMvc Controller Unit Tests (Standalone Setup)
├── service/             # Service Layer Unit Tests (Mockito)
└── config/              # Configuration / DB Seeder Integration Tests
```

This strict separation ensures that a developer looking for database logic always checks the `repository` folder, while someone debugging HTTP status codes will immediately check the `controller` folder.

---

## 3. Core Architectural Design Patterns

The backend leverages established enterprise software design patterns to ensure maintainability, testability, and loose coupling.

### 3.1. N-Tier (Layered) Architecture
- **Controller Layer (Presentation):** Strictly handles HTTP requests, URL path variable extraction, input validation (`@Valid`), and HTTP response formatting (`ResponseEntity`). No complex `if/else` business rules exist here.
- **Service Layer (Business Logic):** The absolute heart of the application. Contains all business rules, mathematical calculations (e.g., cart totals), transaction boundaries (`@Transactional`), and orchestrates calls between multiple repositories.
- **Repository Layer (Data Access):** Abstracted entirely by Spring Data JPA. Performs CRUD operations and custom JPQL database queries.

### 3.2. Builder Pattern
Using Lombok's `@Builder` annotation, complex DTOs and Entities are constructed safely and immutably without relying on massive, telescoping constructors.
```java
OrderResponse response = OrderResponse.builder()
    .id(order.getId())
    .grandTotal(order.getGrandTotal())
    .status(order.getStatus())
    .build();
```
This pattern is heavily utilized when transforming Entities into Responses or generating Test Mocks.

---

## 4. The DTO (Data Transfer Object) Pattern

A critical rule in CHRONOS: **Entities (database models) are never exposed directly to the outside REST API boundaries.**

### 4.1. Why Use DTOs?
- **Security:** Prevents accidental exposure of sensitive database fields like passwords or internal `createdAt` timestamps.
- **Serialization Control:** Avoids `LazyInitializationException` errors when Jackson tries to serialize un-fetched lazy collections.
- **Circular Reference Prevention:** Prevents infinite recursion (e.g., User has Orders, Order has User, User has Orders...).
- **API Stability:** The database schema can change drastically, but as long as the mapping to the DTO remains the same, the frontend API contract does not break.

### 4.2. Request & Response Separation
CHRONOS implements distinct DTOs for incoming data (`CheckoutRequest`, `LoginRequest`) and outgoing data (`OrderResponse`, `ProductResponse`).

---

## 5. Exception Handling & The Facade Pattern

Instead of sprinkling `try-catch` blocks throughout controllers, the application utilizes a centralized error handling mechanism.

### 5.1. `@RestControllerAdvice`
The `GlobalExceptionHandler` acts as a facade. It intercepts exceptions thrown anywhere in the Controller or Service layers and adapts them into a standardized JSON `ErrorResponse`.

### 5.2. Custom Exceptions
Specific exceptions are defined for domain clarity:
- `EntityNotFoundException` -> Mapped to `404 Not Found`.
- `BadCredentialsException` -> Mapped to `401 Unauthorized`.
- `IllegalArgumentException` -> Mapped to `400 Bad Request`.

This ensures that the frontend always receives a consistent error structure, e.g., `{"timestamp": "...", "status": 404, "error": "User not found"}`.

---

## 6. Spring Security Integration & Configuration

The `SecurityConfig.java` file is the shield of the backend.

### 6.1. Bean Configuration
- Defines the `SecurityFilterChain` bean.
- Disables CSRF (Cross-Site Request Forgery) protection, as it is unnecessary for Stateless JWT-based REST APIs.
- Configures CORS (Cross-Origin Resource Sharing) to allow the frontend application (e.g., `http://localhost:4200`) to communicate with the backend.

### 6.2. Route Whitelisting
Certain endpoints are explicitly opened using `requestMatchers(...).permitAll()`:
- `/api/auth/login`, `/api/auth/signup`
- `/api/public/**` (For viewing the product catalog).

All other endpoints are secured via `.anyRequest().authenticated()`.

---

## 7. Deep Dive: JWT Token Architecture & Flow

Security relies on a **Stateless Session Architecture** using JSON Web Tokens (JWT). The system utilizes `io.jsonwebtoken.jjwt` libraries.

### 7.1. Token Generation (AuthService)
1. **Login Event:** The user sends credentials. `AuthenticationManager.authenticate()` validates them.
2. **Payload Creation:** `JwtService.generateToken(UserDetails)` is invoked. It places the user's email into the "Subject" (`sub`) claim and the Role into custom claims.
3. **Signing:** The token is cryptographically signed using an HMAC SHA-256 algorithm with a highly secure secret key stored in application properties.

### 7.2. The `JwtAuthFilter` (Gatekeeper)
This filter extends `OncePerRequestFilter` to intercept every single HTTP request before it reaches the Controller.
1. Checks the `Authorization` header for the `Bearer ` prefix.
2. Extracts the token string.
3. Invokes `jwtService.extractUsername(token)`. If the signature is invalid or expired, an exception is thrown.
4. Loads the user via `UserDetailsServiceImpl`.
5. Creates an `UsernamePasswordAuthenticationToken` and injects it into the `SecurityContextHolder`.

### 7.3. Stateless Architecture
Because of `SessionCreationPolicy.STATELESS`, the server does not store a JSESSIONID in memory. Every request must be authenticated independently via the token. This makes the backend incredibly easy to scale horizontally across multiple instances, as there is no session synchronization required.

---

## 8. Role-Based Access Control (RBAC) Mechanics

The platform caters to three distinct user types: `INDIVIDUAL`, `CORPORATE`, and `ADMIN`.

### 8.1. The Role Enum
The `Role` enum defines these constants. When the JWT is decoded, the role is prefixed with `ROLE_` to comply with Spring Security standards, resulting in `GrantedAuthority` objects like `ROLE_ADMIN`.

### 8.2. Endpoint Authorization
Authorization is enforced either via `SecurityConfig` matchers:
```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.requestMatchers("/api/corporate/**").hasRole("CORPORATE")
```
Or via method-level security:
```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/users")
```
Unauthorized access instantly returns a `403 Forbidden` status.

---

## 9. The Repository Layer & Spring Data JPA

The Repository layer is entirely abstracted by extending `JpaRepository<Entity, ID>`.

### 9.1. Derived Query Methods
Spring Data JPA automatically implements queries based on method names.
```java
Optional<User> findByEmail(String email);
List<Order> findByUserOrderByCreatedAtDesc(User user);
```

### 9.2. Custom Queries
For complex aggregations or joins, the `@Query` annotation is utilized with JPQL (Java Persistence Query Language).
```java
@Query("SELECT p FROM Product p WHERE p.category = :cat AND p.price < :maxPrice")
List<Product> findAffordableProducts(@Param("cat") String cat, @Param("maxPrice") BigDecimal maxPrice);
```

---

## 10. Database Architecture & Optimization Strategies

PostgreSQL is the database engine, interacting with Hibernate.

### 10.1. JPA Relationships
- **@ManyToOne:** Heavily used to link entities to owners. (e.g., A `Product` belongs to a `User` with role CORPORATE).
- **@OneToMany:** Collections representing children (e.g., An `Order` has a List of `OrderItem`).

### 10.2. Fetch Strategies (Avoiding N+1 Problems)
By default, all `@OneToMany` and `@ManyToMany` relationships are set to `FetchType.LAZY`. Data is only queried from the database when the collection is explicitly accessed (e.g., calling `order.getItems().size()`).
This prevents massive, unintended SQL JOIN queries when fetching a list of parent entities.

### 10.3. Cascading
`CascadeType.ALL` is used strategically. For example, when saving a new `Order`, Hibernate automatically persists the attached `OrderItem` children without needing separate `save()` calls.

---

## 11. The Service Layer: Business Logic & Transactions

The Service layer enforces all business rules.

### 11.1. Transactional Integrity
The `@Transactional` annotation from `org.springframework.transaction.annotation` is crucial, especially in the `OrderService`.
During a checkout process:
1. Inventory is checked.
2. Stock is decremented.
3. The Order is saved.
4. The Cart is cleared.

If any of these steps fail (e.g., the database server crashes exactly after step 2), the `@Transactional` context automatically rolls back the entire process. This prevents "dirty reads" or "ghost orders" where stock is lost but no order exists.

### 11.2. Dependency Injection
Services utilize Constructor Injection via Lombok's `@RequiredArgsConstructor`. This is preferred over `@Autowired` field injection because it makes the services immutable and easy to mock during Unit Testing.

---

## 12. The Controller Layer: REST API Boundaries

Controllers represent the presentation tier.

### 12.1. REST Conventions
- **GET:** Retrieving data without side effects.
- **POST:** Creating new resources (e.g., `/api/orders`).
- **PUT:** Entirely replacing a resource or updating status.
- **DELETE:** Removing a resource.

### 12.2. ResponseEntity
Controllers always return `ResponseEntity<T>`, allowing exact control over HTTP Status Codes (200 OK, 201 Created, 204 No Content) and HTTP Headers (e.g., returning `Content-Disposition` headers for CSV Exports in the `AdminController`).

---

## 13. Testing Strategy: Unit Testing with Mockito

Testing the Service layer in complete isolation.

### 13.1. Mocking Dependencies
Service tests utilize `@ExtendWith(MockitoExtension.class)`.
The service under test is annotated with `@InjectMocks`, while its dependent repositories are annotated with `@Mock`.

### 13.2. Behavior Verification
Using Mockito's `when(...).thenReturn(...)`, the tests simulate database responses. We then verify business logic, such as:
- Ensuring an exception is thrown if an applied Discount Code is expired.
- Verifying `repository.save()` is called exactly once using `verify(repo, times(1)).save(any())`.

---

## 14. Testing Strategy: MockMvc & Standalone Controllers

A defining architectural decision in CHRONOS is how Controllers are tested.

### 14.1. The Standalone Setup Approach
Instead of using `@SpringBootTest` or `@WebMvcTest` (which loads the entire Spring Security Context and filter chain), the tests utilize `MockMvcBuilders.standaloneSetup(controller)`.

### 14.2. Why Standalone?
When testing a Controller's logic (e.g., "Does it map the JSON payload to the DTO correctly?"), we do not want to test the Security Filter Chain. Security is tested separately. 
Standalone setup completely isolates the controller, meaning we do not have to generate mock JWT tokens or fake `SecurityContext` logins just to test a simple API endpoint.

### 14.3. Test Implementation
Tests use `MockMvc.perform(...)` to simulate HTTP GET/POST requests and utilize `jsonPath(...)` to assert the structure of the returned JSON payload.
Example: Testing that `OrderControllerTest` successfully serializes a `BigDecimal grandTotal` to the frontend.

---

## 15. Data Seeding & Application Bootstrapping

When the application boots, `DataSeeder.java` implements `CommandLineRunner`.

### 15.1. Initialization Logic
It ensures that the database is never completely empty on a fresh deployment. It checks if users exist (`userRepository.count() == 0`). If not, it inserts:
- A default `ADMIN` account.
- A default `CORPORATE` test store.
- Dummy products and discount codes.

### 15.2. Seeder Testing
`DataSeederTest.java` verifies this logic by overriding the repository methods and ensuring that the `save()` methods are called the exact correct number of times during the bootstrap phase.

---

## 16. Application Properties & Environment Configuration

Configuration is managed via `application.yml` (or `.properties`).

### 16.1. Environment Variables
Sensitive data is never hardcoded. Instead, properties reference environment variables:
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/chronos}
    username: ${DB_USER:postgres}
    password: ${DB_PASS:password}
```
### 16.2. Profile Specific Configurations
Spring Profiles (`dev`, `prod`, `test`) can be used to switch between an in-memory H2 database during CI/CD testing and a real PostgreSQL database in production.

---

## 17. Conclusion & Future Roadmap

The CHRONOS backend is engineered with uncompromising standards. By enforcing rigorous DTO boundaries, utilizing stateless JWTs for extreme horizontal scalability, isolating business logic via N-Tier design, and mandating comprehensive MockMvc and Mockito test coverage, the architecture is hardened against regression and ready for enterprise-level deployment. 

Future expansions can easily integrate Caching mechanisms (Redis) into the Service layer or Message Brokers (RabbitMQ/Kafka) for asynchronous event processing, without requiring any changes to the Controller or Security layers.
