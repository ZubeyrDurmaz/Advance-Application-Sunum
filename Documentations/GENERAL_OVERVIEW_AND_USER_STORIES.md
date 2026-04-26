# CHRONOS: General Platform Overview & Real-Life User Stories

CHRONOS is an enterprise-grade, multi-vendor B2B and B2C luxury e-commerce platform powered by Artificial Intelligence (AI). It unites luxury watch enthusiasts, global watch boutiques, and system administrators under a single, highly performant ecosystem.

This document aims to explain how the system operates by illustrating **real-life user personas and stories**, directly utilizing the actual data and roles seeded in the CHRONOS database.

---

## 1. Ecosystem Overview

The CHRONOS ecosystem revolves around three primary actors:
1. **The Individual User (Buyer):** A standard consumer or watch collector who visits the platform to explore luxury watches, use AI for recommendations, and make secure purchases.
2. **The Corporate Seller (Boutique Owner):** A business owner who manages a digital storefront (e.g., "Chronos Boutique NYC" or "Chronos Atelier LA"), lists their high-end inventory, and generates revenue.
3. **The System Administrator (Admin):** The superuser who governs the luxury marketplace, approves new boutique applications, creates global discount codes (like WELCOME10, LUXURY500), and ensures platform security via audit logs.

Let's take a closer look at a typical day for these three actors using real data from our system.

---

## 2. Scenario 1: The Individual User (Alexander Vane's Shopping Experience)

**Profile:** Alexander Vane (`curator@chronos.com`), a watch collector and individual user (Role: `INDIVIDUAL`). He is looking for a new, iconic "Dress Sport" watch but doesn't want to waste time scrolling through thousands of options.

### Alexander's Journey on CHRONOS:
1. **Meeting the AI Assistant (Chronos AI):** 
   Alexander visits the site and navigates directly to the **Chronos AI** tab. He types a natural query into the search bar: *"I am looking for an iconic, everyday luxury watch made of stainless steel under $10,000."*
   The backend NLP (Natural Language Processing) service analyzes this sentence and instantly recommends the iconic **"Santos de Cartier" (SKU: WSSA0018)**, priced exactly at $6,800.
2. **Product Review and Cart:**
   Alexander clicks on the recommended watch (`/product/WSSA0018`). On the Product Detail Page (PDP), he confirms the watch is in stock and confidently clicks the `Add to Cart` button.
3. **Seamless Checkout:**
   He proceeds to the checkout page (`/cart` -> Checkout). The system automatically retrieves Alexander's default shipping address and securely tokenized credit card information from his `CustomerProfile`.
4. **Applying a Discount Code:**
   Since it's his first purchase, he enters the promotional code `WELCOME10` created by the admins. The `OrderService` instantly calculates a 10% discount on the $6,800 cart, updating his Grand Total to $6,120.
5. **A Happy Ending:**
   He confirms the order. Behind the scenes (within a strict `@Transactional` context), the CHRONOS system deducts the Santos de Cartier stock from the "Chronos Official" store, generates a formal `Order` receipt, and provides Alexander with a tracking number.

---

## 3. Scenario 2: The Corporate Seller (The Boutique Director's Operations)

**Profile:** The Boutique Director (`boutique@chronos.com`), a corporate user (Role: `CORPORATE`) managing the prestigious **"Chronos Boutique NYC"** physical and digital storefront.

### The Boutique Director's Journey on CHRONOS:
1. **Authentication and Routing:** 
   The Director logs in using their email and the password `Boutique2024!`. The JWT Access Token they receive contains the `ROLE_CORPORATE` claim, which automatically routes them to the exclusive "Corporate Dashboard".
2. **Inventory Management:**
   They navigate to the inventory panel to add a new **"Submariner Date" (126610LN)** to their catalog. They set the price at $10,400, categorize it under "Professional Diving", and declare a stock quantity of 4 units. Physically, this stock is managed through the platform's "Midwest Hub" warehouse in Chicago.
3. **Fulfilling an Order:**
   Shortly after, a **"New Order"** notification pops up on their dashboard. A user has just purchased one of their Submariner watches.
   The Director reviews the order details, checks the logistics status, prepares the package for shipment, and updates the order status to "SHIPPED".
4. **Sales Analytics:**
   At the end of the day, the Director opens the `Corporate Analytics` panel. They analyze interactive charts detailing the monthly sales volume for "Chronos Boutique NYC", specifically monitoring the performance metrics of Rolex versus Cartier models to plan future inventory acquisitions.

---

## 4. Scenario 3: The System Administrator (Platform Governance)

**Profile:** The System Administrator (`admin@chronos.com`), the ultimate authority on the CHRONOS platform (Role: `ADMIN`). Their primary goal is to ensure the luxury marketplace remains secure, profitable, and stable.

### The Administrator's Journey on CHRONOS:
1. **Store Approval and Network Management:**
   The Admin logs into the system in the morning. On the `Admin` dashboard, they notice a pending application from a new luxury boutique in Los Angeles. After reviewing their corporate documents, the Admin changes the status of **"Chronos Atelier LA"** to "OPEN" (Active). The store owner (`atelier@chronos.com`) is now officially authorized to sell on the platform.
2. **Creating VIP Discount Campaigns:**
   To reward high-net-worth clients, the Admin creates a new VIP discount code for high-ticket watches.
   - **Code:** `LUXURY500`
   - **Type:** Fixed Amount (`FIXED_AMOUNT`)
   - **Value:** $500
   - **Limits:** Maximum 50 uses (`max_uses = 50`), valid for 60 days.
   The system securely persists these parameters in the database.
3. **Platform Security and Audit Logs:**
   To maintain total transparency, the Admin regularly monitors the `Admin Logs` page. This page lists all system-wide security events.
   They might see a log entry such as: *"Corporate Manager updated the price of 'Cosmograph Daytona' in 'Chronos Official' to $32,450."*
   If needed for auditing purposes, the Admin can export these records as a `.csv` file (`/api/admin/logs/csv`) and send them to the accounting and compliance departments.

---

## 5. Under the Hood: Technical Architecture Snapshot

The ability for these three entirely different worlds (Alexander, the Boutique Director, and the Administrator) to operate flawlessly on the same platform relies on CHRONOS's robust architecture:

- **When Alexander buys the Cartier:** 
  The backend `@Transactional` context takes over. Once Alexander's payment clears, the system locks and updates the store's inventory and the warehouse's `ProductLocation` records within milliseconds. If a database failure occurs during this exact moment, the transaction "rolls back", ensuring no money is lost and inventory remains intact.
  
- **When the Director views their dashboard:**
  They cannot access the Administrator pages. When the Director logs in, their JWT token is stamped with `ROLE_CORPORATE`. Both the `RoleGuard` (Frontend Angular Router) and the `JwtAuthFilter` (Backend Spring Security) will instantly block any attempt by the Director to access `/admin` endpoints, returning an HTTP 403 (Forbidden) error.
  
- **When the Administrator creates "LUXURY500":**
  The data is written directly to the `discount_codes` table. When Alexander applies this code, the `OrderService` instantly queries this table to verify if the code has expired (`validUntil`) or if the usage limit has been exceeded (`usedCount` < `maxUses`).

**In Summary:** CHRONOS represents a flawless, elite shopping experience for Alexander Vane, a massive digital storefront for global luxury boutiques, and a fully auditable, transparent technological empire for its Administrators. Its architecture is explicitly designed to handle thousands of concurrent transactions per second with absolute zero-fault tolerance.
