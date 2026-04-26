# 🕰️ CHRONOS Luxury E-Commerce Platform

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-brightgreen?style=for-the-badge&logo=spring-boot)
![Angular](https://img.shields.io/badge/Angular-17-red?style=for-the-badge&logo=angular)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)
![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java)

**CHRONOS** is an enterprise-grade, multi-vendor B2B and B2C luxury e-commerce platform. It seamlessly connects individual luxury watch collectors with global corporate boutiques, all governed by a robust administrative backend. 

The platform features an AI-driven natural language search, advanced Role-Based Access Control (RBAC), and a highly secure Dual-Token JWT stateless architecture.

---

## ✨ Key Features

- **🤖 Chronos AI:** NLP-powered product discovery. Users can search for products using natural language sentences.
- **🛡️ Multi-Tiered Architecture:** Complete separation between `INDIVIDUAL`, `CORPORATE` (Sellers), and `ADMIN` users via strict RBAC.
- **🔒 Advanced Security:** Stateless Dual-Token JWT (Access & Refresh), BCrypt password hashing, and XSS/CSRF mitigations.
- **🏬 Multi-Vendor Stores:** Corporate users can open boutiques, manage inventory across global warehouses, and track real-time analytics.
- **🛒 Robust Checkout Flow:** Transactional integrity ensuring stock levels, discounts, and payments are processed synchronously.
- **📊 Admin Governance:** System-wide audit logging with CSV export capabilities and global VIP discount code generation.
- **💎 Premium UI/UX:** A bespoke, glassmorphic dark-theme frontend built with vanilla CSS variables and Angular Standalone components.

---

## 📚 Comprehensive Documentation

The architecture and design patterns of CHRONOS are extensively documented. Please refer to the following files located in the root directory for deep technical insights:

1. [**GENERAL_OVERVIEW_AND_USER_STORIES.md**](./GENERAL_OVERVIEW_AND_USER_STORIES.md) - Real-life scenarios and high-level platform overview.
2. [**BACKEND_DOCUMENTATION.md**](./BACKEND_DOCUMENTATION.md) - N-Tier architecture, DTO patterns, Transactional logic, and MockMvc testing strategies.
3. [**FRONTEND_DOCUMENTATION.md**](./FRONTEND_DOCUMENTATION.md) - Angular Standalone architecture, RxJS state management, and Smart/Dumb component patterns.
4. [**SECURITY_ARCHITECTURE.md**](./SECURITY_ARCHITECTURE.md) - Deep dive into the "Zero Trust" model, JwtAuthFilter, and Audit Logging.
5. [**DATABASE_NORMALIZATION.md**](./DATABASE_NORMALIZATION.md) - The journey from UNF to 3NF and the final Entity-Relationship (ER) diagram.
6. [**API_ENDPOINTS_SUMMARY.md**](./API_ENDPOINTS_SUMMARY.md) - The complete RESTful API contract.

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Language:** Java 21
- **Security:** Spring Security 6, JWT (`io.jsonwebtoken`)
- **Data Access:** Spring Data JPA, Hibernate
- **Database:** PostgreSQL
- **Testing:** JUnit 5, Mockito, Spring MockMvc

### Frontend
- **Framework:** Angular 17+ (100% Standalone Components)
- **Language:** TypeScript
- **State Management:** RxJS (Observables, BehaviorSubjects)
- **Styling:** Vanilla CSS3 (Custom Properties, CSS Grid, Flexbox)

---

## 🚀 How to Run Locally

### Prerequisites
- Java 21+
- Node.js 18+ & npm
- PostgreSQL 16+
- Maven

### 1. Database Setup
Ensure PostgreSQL is running on `localhost:5432`. Create a database named `chronos`.
Update your `backend/src/main/resources/application.properties` or `application.yml` with your PostgreSQL credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/chronos
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### 2. Start the Backend
Navigate to the `backend` directory and run the Spring Boot application:
```bash
cd backend
mvn spring-boot:run
```
*Note: Upon the first startup, the `DataSeeder` will automatically populate the database with default users, products, stores, and discount codes.*

### 3. Start the Frontend
Navigate to the `frontend` directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm start
```
The application will be available at `http://localhost:4200`.

---

## 🔑 Default Seeded Accounts (For Testing)

You can log in to the platform immediately using the following seeded accounts:

| Role | Email | Password |
|------|-------|----------|
| **INDIVIDUAL** | `curator@chronos.com` | `Chronos2024!` |
| **CORPORATE** | `boutique@chronos.com` | `Boutique2024!` |
| **ADMIN** | `admin@chronos.com` | `Admin2024!` |

*(Try logging in with `curator` and using the discount code `WELCOME10` during checkout!)*

---

*Designed and engineered as a comprehensive showcase of modern enterprise web development.*
