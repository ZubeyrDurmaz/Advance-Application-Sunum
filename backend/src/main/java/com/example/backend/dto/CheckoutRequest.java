package com.example.backend.dto;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class CheckoutRequest {
    private List<CheckoutItem> items;
    private String paymentMethod;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CheckoutItem {
        private String sku;
        private int quantity;
    }
}
