package com.example.backend.service;

import com.example.backend.dto.CheckoutRequest;
import com.example.backend.dto.OrderResponse;
import com.example.backend.entity.*;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AuditLogService auditLogService;

    public List<OrderResponse> getOrdersByUserId(String userId) {
        return orderRepository.findByUser_IdOrderByOrderDateDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByStoreId(String storeId) {
        return orderRepository.findByStore_Id(storeId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        return toResponse(order);
    }

    public OrderResponse cancelOrder(String userId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to cancel this order");
        }
        String status = order.getStatus() != null ? order.getStatus().toUpperCase() : "";
        if (status.equals("SHIPPED") || status.equals("DELIVERED") || status.equals("CANCELLED")) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }
        order.setStatus("CANCELLED");
        Order saved = orderRepository.save(order);
        auditLogService.logAction("ORDER_CANCELLED", "User cancelled order", userId, saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public OrderResponse checkout(User user, CheckoutRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Resolve products and compute total
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal grandTotal = BigDecimal.ZERO;
        Store store = null;

        for (CheckoutRequest.CheckoutItem ci : request.getItems()) {
            Product product = productRepository.findBySku(ci.getSku())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + ci.getSku()));
            if (store == null) store = product.getStore();

            BigDecimal lineTotal = product.getUnitPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            grandTotal = grandTotal.add(lineTotal);

            OrderItem oi = OrderItem.builder()
                    .product(product)
                    .quantity(ci.getQuantity())
                    .price(product.getUnitPrice())
                    .build();
            orderItems.add(oi);

            // Decrease stock
            int newStock = (product.getStockQuantity() != null ? product.getStockQuantity() : 0) - ci.getQuantity();
            product.setStockQuantity(Math.max(newStock, 0));
            productRepository.save(product);
        }

        Order order = Order.builder()
                .user(user)
                .store(store)
                .grandTotal(grandTotal)
                .paymentMethod(InputSanitizer.sanitize(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Credit Card"))
                .status("PENDING")
                .build();

        Order saved = orderRepository.save(order);

        // Link items to order
        for (OrderItem oi : orderItems) {
            oi.setOrder(saved);
        }
        saved.setItems(orderItems);
        saved = orderRepository.save(saved);

        auditLogService.logAction("ORDER_CREATED", "User created new order with " + orderItems.size() + " items", user.getEmail(), saved.getId());

        return toResponse(saved);
    }

    private OrderResponse toResponse(Order o) {
        List<OrderResponse.OrderItemResponse> items = o.getItems() != null
                ? o.getItems().stream().map(this::toItemResponse).collect(Collectors.toList())
                : List.of();

        return OrderResponse.builder()
                .id(o.getId())
                .status(o.getStatus())
                .grandTotal(o.getGrandTotal())
                .orderDate(o.getOrderDate() != null ? o.getOrderDate().toString() : null)
                .paymentMethod(o.getPaymentMethod())
                .storeName(o.getStore() != null ? o.getStore().getName() : null)
                .customerName(o.getUser() != null ? o.getUser().getName() : null)
                .customerEmail(o.getUser() != null ? o.getUser().getEmail() : null)
                .items(items)
                .build();
    }

    private OrderResponse.OrderItemResponse toItemResponse(OrderItem oi) {
        return OrderResponse.OrderItemResponse.builder()
                .id(oi.getId())
                .productName(oi.getProduct() != null ? oi.getProduct().getName() : null)
                .productSku(oi.getProduct() != null ? oi.getProduct().getSku() : null)
                .quantity(oi.getQuantity())
                .price(oi.getPrice())
                .build();
    }
}
