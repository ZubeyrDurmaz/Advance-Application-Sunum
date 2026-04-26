package com.example.backend.controller;

import com.example.backend.dto.CheckoutRequest;
import com.example.backend.dto.OrderResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private OrderService orderService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderController orderController;

    private User user;
    private OrderResponse orderResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(orderController)
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(MethodParameter parameter) {
                        return parameter.getParameterAnnotation(AuthenticationPrincipal.class) != null;
                    }
                    @Override
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                        return org.springframework.security.core.userdetails.User.builder()
                                .username("test@example.com")
                                .password("password")
                                .authorities("INDIVIDUAL")
                                .build();
                    }
                })
                .build();

        user = new User();
        user.setId("user-1");
        user.setEmail("test@example.com");

        orderResponse = OrderResponse.builder()
                .id("order-1")
                .grandTotal(BigDecimal.valueOf(100.0))
                .status("PENDING")
                .build();
    }

    @Test
    void getMyOrders_ShouldReturnOrderList() throws Exception {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(orderService.getOrdersByUserId("user-1")).thenReturn(List.of(orderResponse));

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("order-1"))
                .andExpect(jsonPath("$[0].grandTotal").value(100.0));
    }

    @Test
    void getOrder_ShouldReturnOrder() throws Exception {
        when(orderService.getOrderById("order-1")).thenReturn(orderResponse);

        mockMvc.perform(get("/api/orders/order-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("order-1"))
                .andExpect(jsonPath("$.grandTotal").value(100.0));
    }

    @Test
    void cancelOrder_ShouldReturnCanceledOrder() throws Exception {
        OrderResponse canceledOrder = OrderResponse.builder()
                .id("order-1")
                .status("CANCELED")
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(orderService.cancelOrder("user-1", "order-1")).thenReturn(canceledOrder);

        mockMvc.perform(put("/api/orders/order-1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("order-1"))
                .andExpect(jsonPath("$.status").value("CANCELED"));
    }

    @Test
    void checkout_ShouldReturnCreatedOrder() throws Exception {
        CheckoutRequest request = new CheckoutRequest();
        request.setPaymentMethod("CREDIT_CARD");
        request.setItems(List.of(new CheckoutRequest.CheckoutItem("sku-1", 2)));

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(orderService.checkout(eq(user), any(CheckoutRequest.class))).thenReturn(orderResponse);

        mockMvc.perform(post("/api/orders/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("order-1"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }
}
