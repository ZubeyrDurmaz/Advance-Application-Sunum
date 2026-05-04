package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private String id;
    private List<CartItemResponse> items;
    private BigDecimal subtotal;
    private Integer totalItems;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemResponse {
        private String id;
        private String productId;
        private String productName;
        private String productSlug;
        private String productImage;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal total;
    }
}
