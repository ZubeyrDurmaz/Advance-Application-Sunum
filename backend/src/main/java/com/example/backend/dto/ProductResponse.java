package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder @AllArgsConstructor
public class ProductResponse {
    private String id;
    private String name;
    private String sku;
    private BigDecimal unitPrice;
    private Integer stockQuantity;
    private String categoryName;
    private String storeName;
    private String createdAt;
}
