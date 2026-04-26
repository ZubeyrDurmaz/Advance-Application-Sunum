package com.example.backend.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.entity.Category;
import com.example.backend.entity.CustomerProfile;
import com.example.backend.entity.DiscountCode;
import com.example.backend.entity.Distributor;
import com.example.backend.entity.Order;
import com.example.backend.entity.OrderItem;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductLocation;
import com.example.backend.entity.Return;
import com.example.backend.entity.Review;
import com.example.backend.entity.Role;
import com.example.backend.entity.Shipment;
import com.example.backend.entity.Store;
import com.example.backend.entity.User;
import com.example.backend.entity.UserAddress;
import com.example.backend.entity.UserPaymentMethod;
import com.example.backend.entity.Warehouse;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.CustomerProfileRepository;
import com.example.backend.repository.DiscountCodeRepository;
import com.example.backend.repository.DistributorRepository;
import com.example.backend.repository.OrderItemRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductLocationRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.ReturnRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.ShipmentRepository;
import com.example.backend.repository.StoreRepository;
import com.example.backend.repository.UserAddressRepository;
import com.example.backend.repository.UserPaymentMethodRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WarehouseRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final UserPaymentMethodRepository userPaymentMethodRepository;
    private final StoreRepository storeRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final WarehouseRepository warehouseRepository;
    private final DistributorRepository distributorRepository;
    private final ProductLocationRepository productLocationRepository;
    private final DiscountCodeRepository discountCodeRepository;
    private final ReturnRepository returnRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ShipmentRepository shipmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        // 1. Create refresh_tokens table if not exists
        createRefreshTokensTable();

        // 2. Seed users
        if (userRepository.count() == 0) {
            seedUsers();
        } else {
            log.info("Users already exist, skipping seed.");
        }

        // 3. Seed store
        if (storeRepository.count() == 0) {
            seedStore();
        }

        // 4. Seed categories
        if (categoryRepository.count() == 0) {
            seedCategories();
        }

        // 5. Seed products
        if (productRepository.count() == 0) {
            seedProducts();
        }

        // 6. Seed reviews
        if (reviewRepository.count() == 0) {
            seedReviews();
        }

        // 7. Seed customer profile
        if (customerProfileRepository.count() == 0) {
            seedCustomerProfile();
        }

        // 8. Seed user addresses
        if (userAddressRepository.count() == 0) {
            seedUserAddresses();
        }

        // 9. Seed user payment methods
        if (userPaymentMethodRepository.count() == 0) {
            seedUserPaymentMethods();
        }

        // 10. Seed warehouses
        if (warehouseRepository.count() == 0) {
            seedWarehouses();
        }

        // 11. Seed distributors
        if (distributorRepository.count() == 0) {
            seedDistributors();
        }

        // 12. Seed product locations
        if (productLocationRepository.count() == 0) {
            seedProductLocations();
        }

        // 13. Seed discount codes
        if (discountCodeRepository.count() == 0) {
            seedDiscountCodes();
        }

        // 14. Seed orders and order items (needed for returns and shipments)
        if (orderRepository.count() == 0) {
            seedOrders();
        }

        // 15. Seed returns
        if (returnRepository.count() == 0) {
            seedReturns();
        }

        // 16. Seed shipments
        if (shipmentRepository.count() == 0) {
            seedShipments();
        }

        // 17. Update existing table modifications
        ensureAdditionalStores();
        updateExistingLocations();
        updateExistingUsers();
        updateExistingCategories();
        updateExistingProducts();
        updateExistingOrders();
        updateExistingOrderItems();
        updateExistingReviews();

        log.info("=== Data seeding complete ===");
    }

    private void createRefreshTokensTable() {
        try {
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS refresh_tokens (
                    id VARCHAR(255) PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
                    token VARCHAR(500) NOT NULL UNIQUE,
                    expiry_date TIMESTAMP NOT NULL
                )
            """);
            log.info("refresh_tokens table ensured.");
        } catch (Exception e) {
            log.warn("refresh_tokens table creation skipped: {}", e.getMessage());
        }
    }

    private void seedUsers() {
        log.info("Seeding users...");
        createUser("Alexander Vane", "curator@chronos.com", "Chronos2024!", Role.INDIVIDUAL);
        createUser("Corporate Manager", "corporate@chronos.com", "Corporate2024!", Role.CORPORATE);
        createUser("Boutique Director", "boutique@chronos.com", "Boutique2024!", Role.CORPORATE);
        createUser("Atelier Owner", "atelier@chronos.com", "Atelier2024!", Role.CORPORATE);
        createUser("System Administrator", "admin@chronos.com", "Admin2024!", Role.ADMIN);
        log.info("5 users seeded.");
    }

    private void createUser(String name, String email, String rawPassword, Role role) {
        String encoded = passwordEncoder.encode(rawPassword);
        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .email(email)
                .password(encoded)
                .passwordHash(encoded)
                .role(role)
                .roleType(role.name())
                .build();
        userRepository.save(user);
        log.info("  User created: {} ({})", email, role);
    }

    private void seedStore() {
        log.info("Seeding stores...");
        User corporate = userRepository.findByEmail("corporate@chronos.com").orElseThrow();
        User boutique   = userRepository.findByEmail("boutique@chronos.com").orElseThrow();
        User atelier    = userRepository.findByEmail("atelier@chronos.com").orElseThrow();

        storeRepository.save(Store.builder().id(UUID.randomUUID().toString())
                .name("Chronos Official").owner(corporate).status("OPEN").build());
        storeRepository.save(Store.builder().id(UUID.randomUUID().toString())
                .name("Chronos Boutique NYC").owner(boutique).status("OPEN").build());
        storeRepository.save(Store.builder().id(UUID.randomUUID().toString())
                .name("Chronos Atelier LA").owner(atelier).status("OPEN").build());
        log.info("  3 stores seeded.");
    }

    private void seedCategories() {
        log.info("Seeding categories...");
        String[] names = {
            "Professional Diving", "Grand Complications", "Complications",
            "Dress Watch", "Iconic Sports", "Travel Watch",
            "Professional Chronograph", "Racing Chronograph",
            "Luxury Sports", "High-Frequency Chronograph", "Iconic Dress Sport"
        };
        for (String name : names) {
            Category cat = Category.builder()
                    .id(UUID.randomUUID().toString())
                    .name(name)
                    .build();
            categoryRepository.save(cat);
        }
        log.info("  {} categories seeded.", names.length);
    }

    private void seedProducts() {
        log.info("Seeding products...");
        Store store = storeRepository.findAll().get(0);

        // Map of category name -> category id for lookup
        Map<String, Category> catMap = new java.util.HashMap<>();
        categoryRepository.findAll().forEach(c -> catMap.put(c.getName(), c));

        Object[][] products = {
            {"VG-SK-001",               "Vanguard Skeleton",      12400, "Grand Complications",           5},
            {"HM-MP-002",               "Heritage Moonphase",     18950, "Complications",                 3},
            {"OM-300-003",              "Ocean Master 300",        9200, "Professional Diving",            8},
            {"126610LN",                "Submariner Date",        10400, "Professional Diving",            4},
            {"116500LN",                "Cosmograph Daytona",     32450, "Grand Complications",            2},
            {"5227R-001",               "Calatrava 5227R",        38200, "Dress Watch",                    3},
            {"15202ST",                 "Royal Oak Jumbo",        72000, "Iconic Sports",                  1},
            {"7900V/110R",              "Overseas Dual Time",     51500, "Travel Watch",                   2},
            {"310.30.42.50.01.001",     "Speedmaster Moonwatch",   6240, "Professional Chronograph",       6},
            {"CBN2A1B.FC6492",          "Carrera Chronograph",     4100, "Racing Chronograph",             7},
            {"5711/1A-010",             "Nautilus Blue Dial",     89000, "Luxury Sports",                  1},
            {"95.9000.9004",            "Defy El Primero",        11500, "High-Frequency Chronograph",     4},
            {"WSSA0018",                "Santos de Cartier",       6800, "Iconic Dress Sport",             5},
        };

        for (Object[] p : products) {
            Product product = Product.builder()
                    .id(UUID.randomUUID().toString())
                    .sku((String) p[0])
                    .name((String) p[1])
                    .unitPrice(BigDecimal.valueOf((int) p[2]))
                    .category(catMap.get((String) p[3]))
                    .store(store)
                    .stockQuantity((int) p[4])
                    .build();
            productRepository.save(product);
        }
        log.info("  {} products seeded.", products.length);
    }

    private void seedReviews() {
        log.info("Seeding reviews...");
        User reviewer = userRepository.findByEmail("curator@chronos.com")
                .orElseThrow();
        Product product = productRepository.findBySku("VG-SK-001")
                .orElseThrow();

        reviewRepository.save(Review.builder()
                .id(UUID.randomUUID().toString())
                .user(reviewer).product(product)
                .starRating(5).sentiment("POSITIVE")
                .build());
        reviewRepository.save(Review.builder()
                .id(UUID.randomUUID().toString())
                .user(reviewer).product(product)
                .starRating(4).sentiment("POSITIVE")
                .build());
        log.info("  2 reviews seeded.");
    }

    private void seedCustomerProfile() {
        log.info("Seeding customer profile...");
        User user = userRepository.findByEmail("curator@chronos.com")
                .orElseThrow();
        CustomerProfile profile = CustomerProfile.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .age(35)
                .city("New York")
                .membershipType("PREMIUM")
                .build();
        customerProfileRepository.save(profile);
        log.info("  Customer profile created.");
    }

    // 8.1 Add warehouse seeding to DataSeeder
    private void seedWarehouses() {
        log.info("Seeding warehouses...");
        List<Store> stores = storeRepository.findAll();
        Store s0 = stores.get(0); // Chronos Official
        Store s1 = stores.size() > 1 ? stores.get(1) : s0; // Boutique NYC
        Store s2 = stores.size() > 2 ? stores.get(2) : s0; // Atelier LA

        createWarehouse("Central Distribution Center", "DISTRIBUTION", "New York",
                       "123 Industrial Blvd, Brooklyn, NY 11201", s0);
        createWarehouse("West Coast Fulfillment", "FULFILLMENT", "Los Angeles",
                       "456 Logistics Ave, Los Angeles, CA 90021", s2);
        createWarehouse("East Coast Storage", "STORAGE", "Boston",
                       "789 Warehouse St, Boston, MA 02128", s0);
        createWarehouse("Midwest Hub", "DISTRIBUTION", "Chicago",
                       "321 Commerce Dr, Chicago, IL 60632", s1);
        createWarehouse("Southeast Depot", "STORAGE", "Atlanta",
                       "654 Supply Chain Rd, Atlanta, GA 30309", s1);

        log.info("  5 warehouses seeded.");
    }

    private void createWarehouse(String name, String type, String city, String address, Store store) {
        Warehouse warehouse = Warehouse.builder()
                .name(name)
                .type(type)
                .city(city)
                .address(address)
                .store(store)
                .build();
        warehouseRepository.save(warehouse);
        log.info("    Warehouse created: {} in {} -> store: {}", name, city, store.getName());
    }

    // 8.2 Add distributor seeding to DataSeeder
    private void seedDistributors() {
        log.info("Seeding distributors...");
        List<Store> stores = storeRepository.findAll();
        Store s0 = stores.get(0);
        Store s1 = stores.size() > 1 ? stores.get(1) : s0;
        Store s2 = stores.size() > 2 ? stores.get(2) : s0;

        createDistributor("Premium Watch Partners", "Chicago",
                         "987 Luxury Ave, Chicago, IL 60611", "contact@premiumwatch.com", s1);
        createDistributor("Luxury Timepiece Network", "Miami",
                         "555 Prestige Blvd, Miami, FL 33131", "info@luxurytime.com", s2);
        createDistributor("Elite Watch Distributors", "Dallas",
                         "777 Excellence Way, Dallas, TX 75201", "sales@elitewatch.com", s0);
        createDistributor("Chronos Partners International", "Seattle",
                         "888 Precision St, Seattle, WA 98101", "partners@chronosintl.com", s2);

        log.info("  4 distributors seeded.");
    }

    private void createDistributor(String name, String city, String address, String contactEmail, Store store) {
        Distributor distributor = Distributor.builder()
                .name(name)
                .city(city)
                .address(address)
                .contactEmail(contactEmail)
                .store(store)
                .build();
        distributorRepository.save(distributor);
        log.info("    Distributor created: {} in {} -> store: {}", name, city, store.getName());
    }

    // 8.3 Add product location seeding to DataSeeder
    private void seedProductLocations() {
        log.info("Seeding product locations...");
        
        List<Product> products = productRepository.findAll();
        List<Warehouse> warehouses = warehouseRepository.findAll();
        List<Distributor> distributors = distributorRepository.findAll();
        
        Random random = new Random();
        int locationCount = 0;
        
        for (Product product : products) {
            // Each product will have 2-4 locations (mix of warehouses and distributors)
            int numLocations = 2 + random.nextInt(3); // 2-4 locations
            
            for (int i = 0; i < numLocations; i++) {
                ProductLocation location = ProductLocation.builder()
                        .id(UUID.randomUUID().toString())
                        .product(product)
                        .quantity(10 + random.nextInt(91)) // 10-100 quantity
                        .status("AVAILABLE")
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                
                // Randomly assign to warehouse or distributor
                if (random.nextBoolean() && !warehouses.isEmpty()) {
                    location.setWarehouse(warehouses.get(random.nextInt(warehouses.size())));
                } else if (!distributors.isEmpty()) {
                    location.setDistributor(distributors.get(random.nextInt(distributors.size())));
                } else if (!warehouses.isEmpty()) {
                    location.setWarehouse(warehouses.get(random.nextInt(warehouses.size())));
                }
                
                productLocationRepository.save(location);
                locationCount++;
            }
        }
        
        log.info("  {} product locations seeded.", locationCount);
    }

    // 8.4 Add discount code seeding to DataSeeder
    private void seedDiscountCodes() {
        log.info("Seeding discount codes...");
        
        Store store = storeRepository.findAll().get(0);
        LocalDateTime now = LocalDateTime.now();
        
        // Create various discount codes
        createDiscountCode(store, "WELCOME10", "PERCENTAGE", new BigDecimal("10.00"), 
                          now.minusDays(1), now.plusDays(30), 100);
        createDiscountCode(store, "LUXURY500", "FIXED_AMOUNT", new BigDecimal("500.00"), 
                          now.minusDays(5), now.plusDays(60), 50);
        createDiscountCode(store, "PREMIUM15", "PERCENTAGE", new BigDecimal("15.00"), 
                          now.minusDays(10), now.plusDays(45), 75);
        createDiscountCode(store, "FLASH25", "PERCENTAGE", new BigDecimal("25.00"), 
                          now.minusDays(2), now.plusDays(7), 25);
        createDiscountCode(store, "VIP1000", "FIXED_AMOUNT", new BigDecimal("1000.00"), 
                          now.minusDays(7), now.plusDays(90), 10);
        createDiscountCode(store, "EXPIRED20", "PERCENTAGE", new BigDecimal("20.00"), 
                          now.minusDays(30), now.minusDays(1), 50); // Expired code
        
        log.info("  6 discount codes seeded.");
    }

    private void createDiscountCode(Store store, String code, String discountType, 
                                   BigDecimal discountValue, LocalDateTime validFrom, 
                                   LocalDateTime validUntil, Integer maxUses) {
        DiscountCode discountCode = DiscountCode.builder()
                .id(UUID.randomUUID().toString())
                .store(store)
                .code(code)
                .discountType(discountType)
                .discountValue(discountValue)
                .validFrom(validFrom)
                .validUntil(validUntil)
                .maxUses(maxUses)
                .usedCount(0)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();
        discountCodeRepository.save(discountCode);
        log.info("    Discount code created: {} ({})", code, discountType);
    }

    // Seed orders and order items — spread across 12 months, 3 stores
    private void seedOrders() {
        log.info("Seeding orders and order items...");

        User curator = userRepository.findByEmail("curator@chronos.com").orElseThrow();
        User admin   = userRepository.findByEmail("admin@chronos.com").orElseThrow();
        List<Store> stores   = storeRepository.findAll();
        List<Product> products = productRepository.findAll();
        Random random = new Random();

        String[] statuses = {"COMPLETED", "DELIVERED", "SHIPPED", "PENDING"};

        // 36 orders spread across 12 months (3 per month), rotating across stores
        int orderCount = 0;
        for (int monthsBack = 11; monthsBack >= 0; monthsBack--) {
            for (int k = 0; k < 3; k++) {
                Store store = stores.get((orderCount) % stores.size());
                User orderUser = (orderCount % 3 == 0) ? admin : curator;

                // Random day in that month
                int daysBack = monthsBack * 30 + random.nextInt(28);
                LocalDateTime orderDate = LocalDateTime.now().minusDays(daysBack);

                Order order = Order.builder()
                        .id(UUID.randomUUID().toString())
                        .user(orderUser)
                        .store(store)
                        .status(statuses[random.nextInt(statuses.length)])
                        .grandTotal(BigDecimal.ZERO)
                        .orderDate(orderDate)
                        .paymentMethod("CREDIT_CARD")
                        .build();
                orderRepository.save(order);

                int numItems = 1 + random.nextInt(3);
                BigDecimal orderTotal = BigDecimal.ZERO;
                for (int j = 0; j < numItems; j++) {
                    Product product = products.get(random.nextInt(products.size()));
                    int qty = 1 + random.nextInt(2);
                    BigDecimal itemPrice = product.getUnitPrice();
                    orderTotal = orderTotal.add(itemPrice.multiply(BigDecimal.valueOf(qty)));
                    orderItemRepository.save(OrderItem.builder()
                            .id(UUID.randomUUID().toString())
                            .order(order).product(product)
                            .quantity(qty).price(itemPrice).build());
                }
                order.setGrandTotal(orderTotal);
                orderRepository.save(order);
                orderCount++;
            }
        }
        log.info("  {} orders seeded across 12 months and {} stores.", orderCount, stores.size());
    }

    // 8.5 Add return and shipment seeding to DataSeeder
    @Transactional
    private void seedReturns() {
        log.info("Seeding returns...");
        
        // Fetch order items with their orders and users eagerly loaded
        List<OrderItem> orderItems = orderItemRepository.findAllWithOrderAndUser();
        
        Random random = new Random();
        
        // Create returns for about 30% of order items
        int returnCount = 0;
        for (OrderItem orderItem : orderItems) {
            if (random.nextDouble() < 0.3) { // 30% chance of return
                String[] reasons = {
                    "Product damaged during shipping",
                    "Not as described",
                    "Changed mind",
                    "Wrong size/model",
                    "Quality issues"
                };
                
                String[] statuses = {"PENDING", "APPROVED", "REJECTED", "COMPLETED"};
                String status = statuses[random.nextInt(statuses.length)];
                
                Return returnRecord = Return.builder()
                        .id(UUID.randomUUID().toString())
                        .orderItem(orderItem)
                        .user(orderItem.getOrder().getUser())
                        .reason(reasons[random.nextInt(reasons.length)])
                        .status(status)
                        .requestedAt(LocalDateTime.now().minusDays(random.nextInt(15)))
                        .createdAt(LocalDateTime.now())
                        .build();
                
                // Set resolved date and refund info for completed returns
                if ("COMPLETED".equals(status) || "APPROVED".equals(status)) {
                    returnRecord.setResolvedAt(LocalDateTime.now().minusDays(random.nextInt(5)));
                    returnRecord.setRefundAmount(orderItem.getPrice());
                    returnRecord.setRefundMethod("CREDIT_CARD");
                }
                
                returnRepository.save(returnRecord);
                returnCount++;
            }
        }
        
        log.info("  {} returns seeded.", returnCount);
    }

    private void seedShipments() {
        log.info("Seeding shipments...");
        
        List<Order> orders = orderRepository.findAll();
        Random random = new Random();
        
        for (Order order : orders) {
            String[] modes = {"STANDARD", "EXPRESS", "OVERNIGHT", "GROUND"};
            String[] statuses = {"PENDING", "SHIPPED", "IN_TRANSIT", "DELIVERED"};
            String[] warehouseNames = {"Central Distribution Center", "West Coast Fulfillment", "East Coast Storage"};
            
            Shipment shipment = Shipment.builder()
                    .id(UUID.randomUUID().toString())
                    .order(order)
                    .warehouse(warehouseNames[random.nextInt(warehouseNames.length)])
                    .mode(modes[random.nextInt(modes.length)])
                    .status(statuses[random.nextInt(statuses.length)])
                    .trackingNumber("TRK" + System.currentTimeMillis() + random.nextInt(1000))
                    .build();
            
            shipmentRepository.save(shipment);
        }
        
        log.info("  {} shipments seeded.", orders.size());
    }

    // 9.1 Update user seeding with gender field
    private void updateExistingUsers() {
        log.info("Updating existing users with gender field...");
        
        List<User> users = userRepository.findAll();
        String[] genders = {"MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"};
        Random random = new Random();
        
        int updatedCount = 0;
        for (User user : users) {
            if (user.getGender() == null || user.getGender().isEmpty()) {
                user.setGender(genders[random.nextInt(genders.length)]);
                userRepository.save(user);
                updatedCount++;
                log.info("    Updated user {} with gender: {}", user.getEmail(), user.getGender());
            }
        }
        
        log.info("  {} users updated with gender field.", updatedCount);
    }

    // 9.2 Update category seeding with hierarchy
    private void updateExistingCategories() {
        log.info("Updating existing categories with hierarchy...");
        
        List<Category> categories = categoryRepository.findAll();
        
        // Create hierarchical structure for existing categories
        if (categories.size() >= 3) {
            // Set up some parent-child relationships
            Category parentCategory = null;
            
            // Find a category to use as parent (e.g., "Grand Complications")
            for (Category cat : categories) {
                if ("Grand Complications".equals(cat.getName())) {
                    parentCategory = cat;
                    break;
                }
            }
            
            if (parentCategory == null && !categories.isEmpty()) {
                parentCategory = categories.get(0); // Use first category as parent
            }
            
            int updatedCount = 0;
            if (parentCategory != null) {
                // Set some categories as children of the parent
                for (Category cat : categories) {
                    if (!cat.getId().equals(parentCategory.getId()) && 
                        cat.getParent() == null && 
                        updatedCount < 3) { // Limit to 3 child categories
                        
                        cat.setParent(parentCategory);
                        categoryRepository.save(cat);
                        updatedCount++;
                        log.info("    Set {} as child of {}", cat.getName(), parentCategory.getName());
                    }
                }
            }
            
            log.info("  {} categories updated with hierarchy.", updatedCount);
        } else {
            log.info("  Not enough categories to create hierarchy.");
        }
    }

    // 9.3 Update product seeding with new fields
    private void updateExistingProducts() {
        log.info("Updating existing products with new fields...");
        
        List<Product> products = productRepository.findAll();
        String[] availabilityStatuses = {"IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "DISCONTINUED"};
        Random random = new Random();
        
        int updatedCount = 0;
        for (Product product : products) {
            boolean needsUpdate = false;
            
            // Update description if missing (using raw SQL since entity might not have field yet)
            try {
                jdbcTemplate.update(
                    "UPDATE products SET description = ? WHERE id = ? AND (description IS NULL OR description = '')",
                    generateProductDescription(product), product.getId()
                );
                needsUpdate = true;
            } catch (Exception e) {
                log.debug("Description field may not exist yet: {}", e.getMessage());
            }
            
            // Update availability_status if missing
            try {
                String status = availabilityStatuses[random.nextInt(availabilityStatuses.length)];
                jdbcTemplate.update(
                    "UPDATE products SET availability_status = ? WHERE id = ? AND (availability_status IS NULL OR availability_status = '')",
                    status, product.getId()
                );
                needsUpdate = true;
            } catch (Exception e) {
                log.debug("Availability_status field may not exist yet: {}", e.getMessage());
            }
            
            if (needsUpdate) {
                updatedCount++;
                log.info("    Updated product: {}", product.getName());
            }
        }
        
        log.info("  {} products updated with new fields.", updatedCount);
    }

    private String generateProductDescription(Product product) {
        String[] descriptions = {
            "Exquisite timepiece crafted with precision and attention to detail. Features premium materials and exceptional build quality.",
            "Luxury watch combining traditional craftsmanship with modern innovation. Perfect for discerning collectors.",
            "Professional-grade timepiece designed for accuracy and durability. Suitable for both formal and casual occasions.",
            "Elegant watch featuring sophisticated design elements and superior functionality. A true statement piece.",
            "Premium timepiece showcasing exceptional artistry and technical excellence. Built to last generations."
        };
        
        Random random = new Random();
        return descriptions[random.nextInt(descriptions.length)];
    }

    // 9.4 Update order and order item seeding
    private void updateExistingOrders() {
        log.info("Updating existing orders with new fields...");
        
        List<Order> orders = orderRepository.findAll();
        List<DiscountCode> discountCodes = discountCodeRepository.findAll();
        String[] fulfillmentTypes = {"WAREHOUSE", "DISTRIBUTOR", "DIRECT_SHIP", "PICKUP"};
        String[] salesChannels = {"ONLINE", "MOBILE_APP", "PHONE", "IN_STORE"};
        Random random = new Random();
        
        int updatedCount = 0;
        for (Order order : orders) {
            try {
                // Randomly assign discount code (30% chance)
                String discountCodeId = null;
                BigDecimal discountAmount = BigDecimal.ZERO;
                
                if (random.nextDouble() < 0.3 && !discountCodes.isEmpty()) {
                    DiscountCode discountCode = discountCodes.get(random.nextInt(discountCodes.size()));
                    discountCodeId = discountCode.getId();
                    
                    // Calculate discount amount based on type
                    if ("PERCENTAGE".equals(discountCode.getDiscountType())) {
                        discountAmount = order.getGrandTotal()
                            .multiply(discountCode.getDiscountValue())
                            .divide(BigDecimal.valueOf(100));
                    } else {
                        discountAmount = discountCode.getDiscountValue();
                    }
                }
                
                String fulfillment = fulfillmentTypes[random.nextInt(fulfillmentTypes.length)];
                String salesChannel = salesChannels[random.nextInt(salesChannels.length)];
                
                // Update using raw SQL since entity might not have fields yet
                jdbcTemplate.update(
                    "UPDATE orders SET discount_code_id = ?, discount_amount = ?, fulfilment = ?, sales_channel = ? WHERE id = ?",
                    discountCodeId, discountAmount, fulfillment, salesChannel, order.getId()
                );
                
                updatedCount++;
                log.info("    Updated order {} with fulfillment: {}, channel: {}", 
                        order.getId().substring(0, 8), fulfillment, salesChannel);
                
            } catch (Exception e) {
                log.debug("Order fields may not exist yet: {}", e.getMessage());
            }
        }
        
        
        // Also ensure no orders belong to corporate user (reassign them to admin to hide from their own store)
        try {
            jdbcTemplate.update(
                "UPDATE orders SET user_id = (SELECT id FROM users WHERE email = 'admin@chronos.com') WHERE user_id = (SELECT id FROM users WHERE email = 'corporate@chronos.com')"
            );
        } catch (Exception e) {
            log.debug("Failed to reassign corporate orders: {}", e.getMessage());
        }
        
        log.info("  {} orders updated with new fields.", updatedCount);
    }

    private void updateExistingOrderItems() {
        log.info("Updating existing order items with new fields...");
        
        List<OrderItem> orderItems = orderItemRepository.findAll();
        List<Warehouse> warehouses = warehouseRepository.findAll();
        List<Distributor> distributors = distributorRepository.findAll();
        Random random = new Random();
        
        int updatedCount = 0;
        for (OrderItem orderItem : orderItems) {
            try {
                String warehouseId = null;
                String distributorId = null;
                
                // Randomly assign to warehouse or distributor
                if (random.nextBoolean() && !warehouses.isEmpty()) {
                    warehouseId = warehouses.get(random.nextInt(warehouses.size())).getId();
                } else if (!distributors.isEmpty()) {
                    distributorId = distributors.get(random.nextInt(distributors.size())).getId();
                }
                
                // Update using raw SQL since entity might not have fields yet
                jdbcTemplate.update(
                    "UPDATE order_items SET warehouse_id = ?, distributor_id = ? WHERE id = ?",
                    warehouseId, distributorId, orderItem.getId()
                );
                
                updatedCount++;
                log.info("    Updated order item {} with warehouse: {}, distributor: {}", 
                        orderItem.getId().substring(0, 8), 
                        warehouseId != null ? "assigned" : "null",
                        distributorId != null ? "assigned" : "null");
                
            } catch (Exception e) {
                log.debug("OrderItem fields may not exist yet: {}", e.getMessage());
            }
        }
        
        log.info("  {} order items updated with new fields.", updatedCount);
    }

    // 9.5 Update review seeding with engagement fields
    private void updateExistingReviews() {
        log.info("Updating existing reviews with engagement fields...");
        
        List<Review> reviews = reviewRepository.findAll();
        String[] titles = {
            "Excellent Quality",
            "Great Value",
            "Highly Recommended",
            "Outstanding Product",
            "Perfect Choice",
            "Amazing Craftsmanship",
            "Worth Every Penny",
            "Exceptional Service"
        };
        
        String[] bodies = {
            "This product exceeded my expectations. The quality is outstanding and the attention to detail is remarkable.",
            "I've been using this for several months now and it continues to impress me. Highly recommended!",
            "The craftsmanship is exceptional. You can tell this was made with care and precision.",
            "Great value for the price. The quality is much better than I expected for this price range.",
            "Perfect addition to my collection. The design is elegant and the functionality is superb.",
            "Outstanding customer service and product quality. Will definitely purchase again.",
            "The product arrived quickly and was exactly as described. Very satisfied with my purchase.",
            "Impressive build quality and attention to detail. This is clearly a premium product."
        };
        
        String[] statuses = {"PUBLISHED", "PENDING", "APPROVED"};
        Random random = new Random();
        
        int updatedCount = 0;
        for (Review review : reviews) {
            try {
                int helpfulVotes = random.nextInt(21); // 0-20 helpful votes
                int totalVotes = helpfulVotes + random.nextInt(11); // Add 0-10 more total votes
                String title = titles[random.nextInt(titles.length)];
                String body = bodies[random.nextInt(bodies.length)];
                String status = statuses[random.nextInt(statuses.length)];
                LocalDateTime updatedAt = LocalDateTime.now();
                
                // Update using raw SQL since entity might not have fields yet
                jdbcTemplate.update(
                    "UPDATE reviews SET helpful_votes = ?, total_votes = ?, title = ?, body = ?, status = ?, updated_at = ? WHERE id = ?",
                    helpfulVotes, totalVotes, title, body, status, updatedAt, review.getId()
                );
                
                updatedCount++;
                log.info("    Updated review {} with title: '{}', votes: {}/{}", 
                        review.getId().substring(0, 8), title, helpfulVotes, totalVotes);
                
            } catch (Exception e) {
                log.debug("Review fields may not exist yet: {}", e.getMessage());
            }
        }
        
        log.info("  {} reviews updated with engagement fields.", updatedCount);
    }

    /** Create boutique/atelier stores if DB was seeded before this version. */
    private void ensureAdditionalStores() {
        if (storeRepository.count() >= 3) return;
        log.info("Creating additional stores...");
        if (!userRepository.existsByEmail("boutique@chronos.com")) {
            createUser("Boutique Director", "boutique@chronos.com", "Boutique2024!", Role.CORPORATE);
        }
        if (!userRepository.existsByEmail("atelier@chronos.com")) {
            createUser("Atelier Owner", "atelier@chronos.com", "Atelier2024!", Role.CORPORATE);
        }
        User boutique = userRepository.findByEmail("boutique@chronos.com").orElseThrow();
        User atelier  = userRepository.findByEmail("atelier@chronos.com").orElseThrow();
        if (storeRepository.findByOwner(boutique).isEmpty()) {
            storeRepository.save(Store.builder().id(UUID.randomUUID().toString())
                    .name("Chronos Boutique NYC").owner(boutique).status("OPEN").build());
        }
        if (storeRepository.findByOwner(atelier).isEmpty()) {
            storeRepository.save(Store.builder().id(UUID.randomUUID().toString())
                    .name("Chronos Atelier LA").owner(atelier).status("OPEN").build());
        }
        log.info("  Additional stores ensured.");
    }

    /** Assign stores to warehouses/distributors that don't have one yet. */
    private void updateExistingLocations() {
        List<Store> stores = storeRepository.findAll();
        if (stores.isEmpty()) return;
        Store s0 = stores.get(0);
        Store s1 = stores.size() > 1 ? stores.get(1) : s0;
        Store s2 = stores.size() > 2 ? stores.get(2) : s0;

        List<Warehouse> warehouses = warehouseRepository.findAll();
        for (int i = 0; i < warehouses.size(); i++) {
            Warehouse w = warehouses.get(i);
            if (w.getStore() == null) {
                w.setStore(i % 3 == 0 ? s0 : i % 3 == 1 ? s1 : s2);
                warehouseRepository.save(w);
            }
        }
        List<Distributor> distributors = distributorRepository.findAll();
        for (int i = 0; i < distributors.size(); i++) {
            Distributor d = distributors.get(i);
            if (d.getStore() == null) {
                d.setStore(i % 3 == 0 ? s1 : i % 3 == 1 ? s2 : s0);
                distributorRepository.save(d);
            }
        }
        log.info("  Warehouse/distributor store assignments updated.");
    }

        private void seedUserAddresses() {
        log.info("Seeding user addresses...");
        
        List<User> users = userRepository.findAll();
        Random random = new Random();
        
        String[] addressTitles = {"Ev", "İş", "Ofis", "Yazlık", "Anne Evi", "Depo"};
        String[] cities = {"İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep"};
        String[] districts = {"Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Bakırköy", "Maltepe", "Ataşehir", "Pendik"};
        String[] streets = {"Atatürk Caddesi", "İnönü Sokak", "Cumhuriyet Bulvarı", "Bağdat Caddesi", "Istiklal Caddesi"};
        
        int addressCount = 0;
        for (User user : users) {
            // Each user gets 1-3 addresses
            int numAddresses = 1 + random.nextInt(3);
            
            for (int i = 0; i < numAddresses; i++) {
                String city = cities[random.nextInt(cities.length)];
                String district = districts[random.nextInt(districts.length)];
                String street = streets[random.nextInt(streets.length)];
                int buildingNo = 1 + random.nextInt(200);
                int apartmentNo = random.nextInt(50);
                
                String fullAddress = String.format("%s No:%d/%d, %s, %s", 
                    street, buildingNo, apartmentNo, district, city);
                
                UserAddress address = UserAddress.builder()
                        .user(user)
                        .addressTitle(addressTitles[random.nextInt(addressTitles.length)])
                        .fullAddress(fullAddress)
                        .city(city)
                        .zipCode(String.format("%05d", 10000 + random.nextInt(90000)))
                        .isDefault(i == 0) // First address is default
                        .build();
                
                userAddressRepository.save(address);
                addressCount++;
            }
        }
        
        log.info("  {} user addresses seeded.", addressCount);
    }

    private void seedUserPaymentMethods() {
        log.info("Seeding user payment methods...");
        
        List<User> users = userRepository.findAll();
        Random random = new Random();
        
        String[] methodTypes = {"Credit Card", "Digital Wallet"};
        String[] creditCardProviders = {"Visa", "MasterCard", "American Express"};
        String[] digitalWalletProviders = {"PayPal", "Apple Pay", "Google Pay"};
        
        int paymentMethodCount = 0;
        for (User user : users) {
            // Each user gets 1-2 payment methods
            int numMethods = 1 + random.nextInt(2);
            
            for (int i = 0; i < numMethods; i++) {
                String methodType = methodTypes[random.nextInt(methodTypes.length)];
                String provider;
                String lastFour = null;
                String expiryDate = null;
                
                if ("Credit Card".equals(methodType)) {
                    provider = creditCardProviders[random.nextInt(creditCardProviders.length)];
                    lastFour = String.format("%04d", random.nextInt(10000));
                    int month = 1 + random.nextInt(12);
                    int year = 2025 + random.nextInt(6); // 2025-2030
                    expiryDate = String.format("%02d/%d", month, year);
                } else {
                    provider = digitalWalletProviders[random.nextInt(digitalWalletProviders.length)];
                }
                
                UserPaymentMethod paymentMethod = UserPaymentMethod.builder()
                        .user(user)
                        .methodType(methodType)
                        .provider(provider)
                        .cardToken("token_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16))
                        .lastFour(lastFour)
                        .expiryDate(expiryDate)
                        .isDefault(i == 0) // First payment method is default
                        .build();
                
                userPaymentMethodRepository.save(paymentMethod);
                paymentMethodCount++;
            }
        }
        
        log.info("  {} user payment methods seeded.", paymentMethodCount);
    }
}
