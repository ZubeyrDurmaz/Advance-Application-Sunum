package com.example.backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class ProductRequest {
    private String name;
    private String sku;
    private BigDecimal unitPrice;
    private Integer stockQuantity;
    private String categoryId;
}
