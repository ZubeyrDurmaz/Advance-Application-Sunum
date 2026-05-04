package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

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

    // Marketing / display fields backed by the database
    private String imageUrl;
    private String description;
    private String brand;
    private String model;
    private String movement;
    private String material;
    private String diameter;
    private String powerReserve;
    private String waterResistance;
    private String availabilityStatus;
    private List<String> features;
    private List<String> images;
}
