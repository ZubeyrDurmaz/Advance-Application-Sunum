package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @Column(length = 255)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 100)
    private String sku;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // -- Marketing / display fields ----------------------------------------
    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "brand", length = 120)
    private String brand;

    @Column(name = "model", length = 120)
    private String model;

    @Column(name = "movement", length = 120)
    private String movement;

    @Column(name = "material", length = 120)
    private String material;

    @Column(name = "diameter", length = 50)
    private String diameter;

    @Column(name = "power_reserve", length = 50)
    private String powerReserve;

    @Column(name = "water_resistance", length = 50)
    private String waterResistance;

    @Column(name = "availability_status", length = 30)
    private String availabilityStatus;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_features",
                     joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "feature", length = 500)
    @Builder.Default
    @org.hibernate.annotations.BatchSize(size = 25)
    private List<String> features = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_images",
                     joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url", length = 1000)
    @Builder.Default
    @org.hibernate.annotations.BatchSize(size = 25)
    private List<String> images = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.id == null) this.id = java.util.UUID.randomUUID().toString();
        if (this.stockQuantity == null) this.stockQuantity = 0;
    }
}
