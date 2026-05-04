package com.example.backend.dto;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class CreateCheckoutSessionRequest {
    private List<CheckoutItem> items;
    private String successUrl;
    private String cancelUrl;
    private String customerEmail;
    private String discountCode; // Discount code to apply
    private Map<String, Object> metadata; // Additional metadata (e.g., shipping address)
    
    @Data
    public static class CheckoutItem {
        private String productId;
        private String name;
        private Long amount; // in cents
        private String currency;
        private Integer quantity;
        private String imageUrl;
    }
}
