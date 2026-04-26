package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @AllArgsConstructor
public class OrderResponse {
    private String id;
    private String status;
    private BigDecimal grandTotal;
    private String orderDate;
    private String paymentMethod;
    private String storeName;
    private String customerName;
    private String customerEmail;
    private List<OrderItemResponse> items;

    @Data @Builder @AllArgsConstructor
    public static class OrderItemResponse {
        private String id;
        private String productName;
        private String productSku;
        private Integer quantity;
        private BigDecimal price;
    }
}
