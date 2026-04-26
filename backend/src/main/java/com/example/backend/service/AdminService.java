package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import com.example.backend.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final DiscountCodeRepository discountCodeRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public List<StoreResponse> getAllStores() {
        return storeRepository.findAll().stream().map(s -> {
            long productCount = productRepository.countByStore_Id(s.getId());
            long orderCount = orderRepository.countByStore_Id(s.getId());
            BigDecimal revenue = orderRepository.sumGrandTotalByStoreId(s.getId());
            return StoreResponse.builder()
                    .id(s.getId()).name(s.getName()).status(s.getStatus())
                    .ownerName(s.getOwner() != null ? s.getOwner().getName() : null)
                    .ownerEmail(s.getOwner() != null ? s.getOwner().getEmail() : null)
                    .createdAt(s.getCreatedAt() != null ? s.getCreatedAt().toString() : null)
                    .productCount(productCount).orderCount(orderCount)
                    .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                    .build();
        }).toList();
    }

    public StoreResponse updateStoreStatus(String storeId, String status) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        store.setStatus(status.toUpperCase(Locale.ENGLISH));
        store = storeRepository.save(store);
        auditLogService.logAction("ADMIN_UPDATE_STORE_STATUS", "Updated store status to " + status, "ADMIN", storeId);
        long productCount = productRepository.countByStore_Id(store.getId());
        long orderCount = orderRepository.countByStore_Id(store.getId());
        BigDecimal revenue = orderRepository.sumGrandTotalByStoreId(store.getId());
        return StoreResponse.builder()
                .id(store.getId()).name(store.getName()).status(store.getStatus())
                .ownerName(store.getOwner() != null ? store.getOwner().getName() : null)
                .ownerEmail(store.getOwner() != null ? store.getOwner().getEmail() : null)
                .createdAt(store.getCreatedAt() != null ? store.getCreatedAt().toString() : null)
                .productCount(productCount).orderCount(orderCount)
                .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .build();
    }

    public List<AdminUserResponse> getAllUsers() {
        Map<String, String> lastActivityMap = new HashMap<>();
        orderRepository.findLatestOrderDatePerUser().forEach(row -> {
            String userId = (String) row[0];
            Object dateVal = row[1];
            if (dateVal != null) {
                lastActivityMap.put(userId, dateVal.toString());
            }
        });

        return userRepository.findAll().stream()
                .map(u -> AdminUserResponse.builder()
                        .id(u.getId()).name(u.getName()).email(u.getEmail())
                        .role(u.getRole() != null ? u.getRole().name() : null)
                        .status("ACTIVE")
                        .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                        .lastActivity(lastActivityMap.getOrDefault(u.getId(), null))
                        .build())
                .toList();
    }

    public AdminUserResponse updateUserRole(String userId, String role) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Role roleEnum;
        try { roleEnum = Role.valueOf(role.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new RuntimeException("Invalid role"); }
        u.setRole(roleEnum);
        u.setRoleType(roleEnum.name());
        
        auditLogService.logAction("ADMIN_UPDATE_USER_ROLE", "Updated user role to " + roleEnum.name(), "ADMIN", u.getId());
        
        return toAdminUserResponse(userRepository.save(u));
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        String lastAct = orderRepository.findByUser_IdOrderByOrderDateDesc(user.getId())
                .stream().findFirst()
                .map(o -> o.getOrderDate() != null ? o.getOrderDate().toString() : null)
                .orElse(null);

        return AdminUserResponse.builder()
                .id(user.getId()).name(user.getName()).email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null).status("ACTIVE")
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .lastActivity(lastAct)
                .build();
    }

    public PlatformAnalyticsResponse getPlatformAnalytics() {
        long totalUsers = userRepository.count();
        long totalStores = storeRepository.count();
        List<Order> allOrders = orderRepository.findAll();
        long totalOrders = allOrders.size();
        BigDecimal totalRevenue = allOrders.stream()
                .map(Order::getGrandTotal).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Monthly revenue
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH);
        Map<String, BigDecimal> revenueByMonth = new LinkedHashMap<>();
        Map<String, Long> ordersByMonth = new LinkedHashMap<>();
        allOrders.forEach(o -> {
            if (o.getOrderDate() != null) {
                String month = o.getOrderDate().format(fmt);
                revenueByMonth.merge(month, o.getGrandTotal() != null ? o.getGrandTotal() : BigDecimal.ZERO, BigDecimal::add);
                ordersByMonth.merge(month, 1L, Long::sum);
            }
        });

        List<CorporateAnalyticsResponse.MonthlyStat> monthly = revenueByMonth.entrySet().stream()
                .map(e -> CorporateAnalyticsResponse.MonthlyStat.builder()
                        .month(e.getKey()).revenue(e.getValue())
                        .orders(ordersByMonth.getOrDefault(e.getKey(), 0L)).build())
                .toList();

        // Top stores by revenue
        Map<String, BigDecimal> storeRevenue = new LinkedHashMap<>();
        Map<String, Long> storeOrders = new LinkedHashMap<>();
        Map<String, String> storeNames = new LinkedHashMap<>();
        allOrders.forEach(o -> {
            if (o.getStore() != null) {
                String sid = o.getStore().getId();
                storeNames.put(sid, o.getStore().getName());
                storeRevenue.merge(sid, o.getGrandTotal() != null ? o.getGrandTotal() : BigDecimal.ZERO, BigDecimal::add);
                storeOrders.merge(sid, 1L, Long::sum);
            }
        });

        List<PlatformAnalyticsResponse.TopStore> topStores = storeRevenue.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .limit(5)
                .map(e -> PlatformAnalyticsResponse.TopStore.builder()
                        .name(storeNames.getOrDefault(e.getKey(), e.getKey()))
                        .orders(storeOrders.getOrDefault(e.getKey(), 0L))
                        .revenue(e.getValue()).build())
                .toList();

        return PlatformAnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .totalStores(totalStores)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthly)
                .topStores(topStores)
                .build();
    }

    // ── Orders ──

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .sorted(Comparator.comparing(Order::getOrderDate, Comparator.nullsFirst(Comparator.reverseOrder())))
                .map(this::toOrderResponse)
                .toList();
    }

    public OrderResponse updateOrderStatus(String orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status.toUpperCase(Locale.ENGLISH));
        auditLogService.logAction("ADMIN_UPDATE_ORDER_STATUS", "Updated order " + orderId + " to " + status, "ADMIN", orderId);
        return toOrderResponse(orderRepository.save(order));
    }

    private OrderResponse toOrderResponse(Order o) {
        List<OrderResponse.OrderItemResponse> items = o.getItems() != null
                ? o.getItems().stream().map(i -> OrderResponse.OrderItemResponse.builder()
                .id(i.getId())
                .productName(i.getProduct() != null ? i.getProduct().getName() : null)
                .productSku(i.getProduct() != null ? i.getProduct().getSku() : null)
                .quantity(i.getQuantity()).price(i.getPrice()).build()).toList()
                : List.of();

        return OrderResponse.builder()
                .id(o.getId()).status(o.getStatus()).grandTotal(o.getGrandTotal())
                .orderDate(o.getOrderDate() != null ? o.getOrderDate().toString() : null)
                .paymentMethod(o.getPaymentMethod())
                .storeName(o.getStore() != null ? o.getStore().getName() : null)
                .customerName(o.getUser() != null ? o.getUser().getName() : null)
                .customerEmail(o.getUser() != null ? o.getUser().getEmail() : null)
                .items(items).build();
    }

    // ── Discount Codes ──

    public List<DiscountCodeResponse> getAllDiscounts() {
        return discountCodeRepository.findAll().stream()
                .sorted(Comparator.comparing(DiscountCode::getCreatedAt, Comparator.nullsFirst(Comparator.reverseOrder())))
                .map(this::toDiscountResponse)
                .toList();
    }

    public DiscountCodeResponse createDiscount(DiscountCodeRequest req) {
        Store store = storeRepository.findById(req.getStoreId())
                .orElseThrow(() -> new RuntimeException("Store not found"));
        DiscountCode dc = DiscountCode.builder()
                .code(InputSanitizer.sanitize(req.getCode().toUpperCase(Locale.ENGLISH)))
                .discountType(InputSanitizer.sanitize(req.getDiscountType()))
                .discountValue(req.getDiscountValue())
                .validFrom(LocalDateTime.parse(req.getValidFrom()))
                .validUntil(LocalDateTime.parse(req.getValidUntil()))
                .maxUses(req.getMaxUses())
                .store(store)
                .build();
        DiscountCode saved = discountCodeRepository.save(dc);
        auditLogService.logAction("ADMIN_CREATE_DISCOUNT", "Created discount code: " + dc.getCode(), "ADMIN", saved.getId());
        return toDiscountResponse(saved);
    }

    public DiscountCodeResponse updateDiscount(String id, DiscountCodeRequest req) {
        DiscountCode dc = discountCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount not found"));
        if (req.getCode() != null) dc.setCode(InputSanitizer.sanitize(req.getCode().toUpperCase(Locale.ENGLISH)));
        if (req.getDiscountType() != null) dc.setDiscountType(InputSanitizer.sanitize(req.getDiscountType()));
        if (req.getDiscountValue() != null) dc.setDiscountValue(req.getDiscountValue());
        if (req.getValidFrom() != null) dc.setValidFrom(LocalDateTime.parse(req.getValidFrom()));
        if (req.getValidUntil() != null) dc.setValidUntil(LocalDateTime.parse(req.getValidUntil()));
        if (req.getMaxUses() != null) dc.setMaxUses(req.getMaxUses());
        if (req.getStoreId() != null) {
            Store store = storeRepository.findById(req.getStoreId())
                    .orElseThrow(() -> new RuntimeException("Store not found"));
            dc.setStore(store);
        }
        return toDiscountResponse(discountCodeRepository.save(dc));
    }

    public void deleteDiscount(String id) {
        discountCodeRepository.deleteById(id);
    }

    public DiscountCodeResponse toggleDiscount(String id) {
        DiscountCode dc = discountCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount not found"));
        dc.setStatus("ACTIVE".equals(dc.getStatus()) ? "INACTIVE" : "ACTIVE");
        return toDiscountResponse(discountCodeRepository.save(dc));
    }

    private DiscountCodeResponse toDiscountResponse(DiscountCode dc) {
        return DiscountCodeResponse.builder()
                .id(dc.getId())
                .code(dc.getCode())
                .discountType(dc.getDiscountType())
                .discountValue(dc.getDiscountValue())
                .validFrom(dc.getValidFrom() != null ? dc.getValidFrom().toString() : null)
                .validUntil(dc.getValidUntil() != null ? dc.getValidUntil().toString() : null)
                .maxUses(dc.getMaxUses())
                .usedCount(dc.getUsedCount())
                .status(dc.getStatus())
                .storeName(dc.getStore() != null ? dc.getStore().getName() : null)
                .createdAt(dc.getCreatedAt() != null ? dc.getCreatedAt().toString() : null)
                .build();
    }

    // ── Products ──

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toProductResponse)
                .toList();
    }

    public ProductResponse updateProduct(String id, ProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (req.getName() != null) p.setName(InputSanitizer.sanitize(req.getName()));
        if (req.getSku() != null) p.setSku(InputSanitizer.sanitize(req.getSku()));
        if (req.getUnitPrice() != null) p.setUnitPrice(req.getUnitPrice());
        if (req.getStockQuantity() != null) p.setStockQuantity(req.getStockQuantity());
        if (req.getCategoryId() != null) {
            categoryRepository.findById(req.getCategoryId()).ifPresent(p::setCategory);
        }
        return toProductResponse(productRepository.save(p));
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    private ProductResponse toProductResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .sku(p.getSku())
                .unitPrice(p.getUnitPrice())
                .stockQuantity(p.getStockQuantity())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .storeName(p.getStore() != null ? p.getStore().getName() : null)
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                .build();
    }
}
