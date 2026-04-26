package com.example.backend.service;

import com.example.backend.dto.CheckoutRequest;
import com.example.backend.dto.OrderResponse;
import com.example.backend.entity.*;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Product testProduct;
    private Store testStore;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id("user-1").email("user@test.com").name("Test User").build();
        testStore = Store.builder().id("store-1").name("Test Store").build();
        testProduct = Product.builder()
                .id("prod-1")
                .sku("SKU-123")
                .name("Test Product")
                .unitPrice(BigDecimal.valueOf(100))
                .stockQuantity(10)
                .store(testStore)
                .build();
    }

    @Test
    void checkout_Successful_CreatesOrderAndDecrementsStock() {
        // Arrange
        CheckoutRequest.CheckoutItem item = new CheckoutRequest.CheckoutItem();
        item.setSku("SKU-123");
        item.setQuantity(2);
        
        CheckoutRequest request = new CheckoutRequest();
        request.setItems(List.of(item));
        request.setPaymentMethod("Credit Card");

        when(productRepository.findBySku("SKU-123")).thenReturn(Optional.of(testProduct));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            if (o.getId() == null) o.setId("order-1");
            return o;
        });

        // Act
        OrderResponse response = orderService.checkout(testUser, request);

        // Assert
        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(200), response.getGrandTotal()); // 100 * 2
        assertEquals("PENDING", response.getStatus());
        assertEquals("Credit Card", response.getPaymentMethod());
        assertEquals(8, testProduct.getStockQuantity()); // 10 - 2

        verify(productRepository).save(testProduct);
        verify(orderRepository, times(2)).save(any(Order.class));
        verify(auditLogService).logAction(eq("ORDER_CREATED"), anyString(), eq("user@test.com"), eq("order-1"));
    }

    @Test
    void checkout_EmptyCart_ThrowsException() {
        CheckoutRequest request = new CheckoutRequest();
        request.setItems(List.of());

        Exception e = assertThrows(RuntimeException.class, () -> orderService.checkout(testUser, request));
        assertEquals("Cart is empty", e.getMessage());
    }

    @Test
    void cancelOrder_Successful() {
        Order order = Order.builder()
                .id("order-1")
                .user(testUser)
                .status("PENDING")
                .build();

        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderResponse response = orderService.cancelOrder("user-1", "order-1");

        assertEquals("CANCELLED", response.getStatus());
        verify(auditLogService).logAction(eq("ORDER_CANCELLED"), anyString(), eq("user-1"), eq("order-1"));
    }

    @Test
    void cancelOrder_Unauthorized_ThrowsException() {
        Order order = Order.builder()
                .id("order-1")
                .user(User.builder().id("other-user").build())
                .status("PENDING")
                .build();

        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));

        Exception e = assertThrows(RuntimeException.class, () -> orderService.cancelOrder("user-1", "order-1"));
        assertEquals("Not authorized to cancel this order", e.getMessage());
    }
}
