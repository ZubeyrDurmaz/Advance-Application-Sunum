package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CorporateService {

    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final AuditLogService auditLogService;

    // ── Store ──

    public StoreResponse getMyStore(String ownerEmail) {
        Store store = getStoreByOwnerEmail(ownerEmail);
        return toStoreResponse(store);
    }

    public StoreResponse updateMyStore(String ownerEmail, String newName) {
        Store store = getStoreByOwnerEmail(ownerEmail);
        store.setName(newName);
        return toStoreResponse(storeRepository.save(store));
    }

    // ── Products ──

    public List<ProductResponse> getMyProducts(String ownerEmail) {
        Store store = getStoreByOwnerEmail(ownerEmail);
        return productRepository.findByStore_Id(store.getId()).stream()
                .map(this::toProductResponse).toList();
    }

    public ProductResponse createProduct(String ownerEmail, ProductRequest req) {
        Store store = getStoreByOwnerEmail(ownerEmail);
        Category category = req.getCategoryId() != null
                ? categoryRepository.findById(req.getCategoryId()).orElse(null)
                : null;

        Product product = Product.builder()
                .store(store)
                .category(category)
                .name(req.getName())
                .sku(req.getSku())
                .unitPrice(req.getUnitPrice())
                .stockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0)
                .build();

        Product saved = productRepository.save(product);
        auditLogService.logAction("CORP_ADD_PRODUCT", "Added product: " + saved.getName(), ownerEmail, saved.getId());
        return toProductResponse(saved);
    }

    public ProductResponse updateProduct(String ownerEmail, String productId, ProductRequest req) {
        Store store = getStoreByOwnerEmail(ownerEmail);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getStore().getId().equals(store.getId())) {
            throw new RuntimeException("Product does not belong to your store");
        }

        if (req.getName() != null) product.setName(req.getName());
        if (req.getSku() != null) product.setSku(req.getSku());
        if (req.getUnitPrice() != null) product.setUnitPrice(req.getUnitPrice());
        if (req.getStockQuantity() != null) product.setStockQuantity(req.getStockQuantity());
        if (req.getCategoryId() != null) {
            categoryRepository.findById(req.getCategoryId()).ifPresent(product::setCategory);
        }

        Product saved = productRepository.save(product);
        auditLogService.logAction("CORP_UPDATE_PRODUCT", "Updated product: " + saved.getName(), ownerEmail, saved.getId());
        return toProductResponse(saved);
    }

    public void deleteProduct(String ownerEmail, String productId) {
        Store store = getStoreByOwnerEmail(ownerEmail);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.getStore().getId().equals(store.getId())) {
            throw new RuntimeException("Product does not belong to your store");
        }
        productRepository.deleteById(productId);
        auditLogService.logAction("CORP_DELETE_PRODUCT", "Deleted product: " + productId, ownerEmail, productId);
    }

    // ── Orders ──

    public List<OrderResponse> getMyOrders(String ownerEmail) {
        Store store = getStoreByOwnerEmail(ownerEmail);
        return orderRepository.findByStore_IdOrderByOrderDateDesc(store.getId()).stream()
                .map(this::toOrderResponse).toList();
    }

    public OrderResponse updateOrderStatus(String ownerEmail, String orderId, String status) {
        Store store = getStoreByOwnerEmail(ownerEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getStore().getId().equals(store.getId())) {
            throw new RuntimeException("Order does not belong to your store");
        }
        order.setStatus(status.toUpperCase(Locale.ENGLISH));
        Order saved = orderRepository.save(order);
        auditLogService.logAction("CORP_UPDATE_ORDER_STATUS", "Updated order status to " + status, ownerEmail, saved.getId());
        return toOrderResponse(saved);
    }

    // ── Customers ──

    public List<CustomerResponse> getMyCustomers(String ownerEmail) {
        Store store = getStoreByOwnerEmail(ownerEmail);
        List<String> customerIds = orderRepository.findDistinctUserIdsByStoreId(store.getId());

        return customerIds.stream().map(userId -> {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return null;

            List<Order> userOrders = orderRepository.findByUser_IdOrderByOrderDateDesc(userId)
                    .stream().filter(o -> o.getStore().getId().equals(store.getId())).toList();

            BigDecimal totalSpent = userOrders.stream()
                    .map(Order::getGrandTotal)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String lastOrder = userOrders.isEmpty() ? null :
                    userOrders.get(0).getOrderDate().toLocalDate().toString();

            return CustomerResponse.builder()
                    .id(user.getId()).name(user.getName()).email(user.getEmail())
                    .orderCount(userOrders.size()).totalSpent(totalSpent).lastOrderDate(lastOrder)
                    .build();
        }).filter(Objects::nonNull).toList();
    }

    // ── Reviews ──

    public List<ReviewResponse> getMyReviews(String ownerEmail) {
        Store store = getStoreByOwnerEmail(ownerEmail);
        List<Product> storeProducts = productRepository.findByStore_Id(store.getId());
        return storeProducts.stream()
                .flatMap(p -> reviewRepository.findByProduct_IdOrderByCreatedAtDesc(p.getId()).stream())
                .sorted(Comparator.comparing(Review::getCreatedAt, Comparator.nullsFirst(Comparator.reverseOrder())))
                .map(r -> ReviewResponse.builder()
                        .id(r.getId())
                        .userName(r.getUser() != null ? r.getUser().getName() : "—")
                        .productName(r.getProduct() != null ? r.getProduct().getName() : "—")
                        .starRating(r.getStarRating())
                        .sentiment(r.getSentiment())
                        .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                        .build())
                .toList();
    }

    // ── Analytics ──

    public CorporateAnalyticsResponse getAnalytics(String ownerEmail) {
        Store store = getStoreByOwnerEmail(ownerEmail);
        List<Order> allOrders = orderRepository.findByStore_IdOrderByOrderDateDesc(store.getId());

        BigDecimal totalRevenue = allOrders.stream()
                .map(Order::getGrandTotal).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalCustomers = orderRepository.findDistinctUserIdsByStoreId(store.getId()).size();
        long totalProducts = productRepository.countByStore_Id(store.getId());

        // Monthly sales — all orders count
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
                        .orders(ordersByMonth.getOrDefault(e.getKey(), 0L))
                        .build())
                .toList();

        // Top products by units sold (from all orders)
        Map<String, Long> unitsSoldByProduct = new LinkedHashMap<>();
        Map<String, BigDecimal> revenueByProduct = new LinkedHashMap<>();
        Map<String, String> productNames = new LinkedHashMap<>();

        allOrders.forEach(o -> {
            if (o.getItems() != null) {
                o.getItems().forEach(item -> {
                    String pid = item.getProduct() != null ? item.getProduct().getId() : "unknown";
                    String name = item.getProduct() != null ? item.getProduct().getName() : "Unknown";
                    productNames.put(pid, name);
                    unitsSoldByProduct.merge(pid, (long) item.getQuantity(), Long::sum);
                    BigDecimal rev = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    revenueByProduct.merge(pid, rev, BigDecimal::add);
                });
            }
        });

        // Build top products with ratings, then sort by revenue desc
        List<CorporateAnalyticsResponse.TopProduct> topProducts = unitsSoldByProduct.entrySet().stream()
                .map(e -> {
                    List<Review> reviews = reviewRepository.findByProduct_IdOrderByCreatedAtDesc(e.getKey());
                    double avgRating = reviews.isEmpty() ? 0.0
                            : reviews.stream().mapToInt(Review::getStarRating).average().orElse(0.0);
                    avgRating = Math.round(avgRating * 10.0) / 10.0;
                    return CorporateAnalyticsResponse.TopProduct.builder()
                            .name(productNames.getOrDefault(e.getKey(), e.getKey()))
                            .unitsSold(e.getValue())
                            .revenue(revenueByProduct.getOrDefault(e.getKey(), BigDecimal.ZERO))
                            .averageRating(avgRating)
                            .build();
                })
                .sorted(Comparator.comparing(CorporateAnalyticsResponse.TopProduct::getRevenue).reversed())
                .limit(5)
                .toList();

        // Review stats for the store's products
        List<Product> storeProducts = productRepository.findByStore_Id(store.getId());
        List<Review> allReviews = storeProducts.stream()
                .flatMap(p -> reviewRepository.findByProduct_IdOrderByCreatedAtDesc(p.getId()).stream())
                .toList();
        long totalReviews = allReviews.size();
        double avgStoreRating = allReviews.isEmpty() ? 0.0
                : Math.round(allReviews.stream().mapToInt(Review::getStarRating).average().orElse(0.0) * 10.0) / 10.0;

        return CorporateAnalyticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(allOrders.size())
                .totalProducts(totalProducts)
                .totalCustomers(totalCustomers)
                .totalReviews(totalReviews)
                .averageStoreRating(avgStoreRating)
                .monthlySales(monthly)
                .topProducts(topProducts)
                .build();
    }

    // ── Helpers ──

    private Store getStoreByOwnerEmail(String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Store> stores = storeRepository.findByOwner_Id(owner.getId());
        if (stores.isEmpty()) {
            // Create a default store for corporate users on first access
            Store store = Store.builder()
                    .owner(owner)
                    .name(owner.getName() + "'s Store")
                    .status("OPEN")
                    .build();
            return storeRepository.save(store);
        }
        return stores.get(0);
    }

    private StoreResponse toStoreResponse(Store s) {
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
    }

    private ProductResponse toProductResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId()).name(p.getName()).sku(p.getSku())
                .unitPrice(p.getUnitPrice()).stockQuantity(p.getStockQuantity())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .storeName(p.getStore() != null ? p.getStore().getName() : null)
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                .build();
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
}
