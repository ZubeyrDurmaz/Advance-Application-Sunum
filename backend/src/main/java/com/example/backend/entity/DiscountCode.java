package com.example.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "discount_codes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DiscountCode {

    @Id
    @Column(length = 255)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false, length = 50, unique = true)
    private String code;

    @Column(name = "discount_type", nullable = false, length = 50)
    private String discountType;

    @Column(name = "discount_value", nullable = false)
    private BigDecimal discountValue;

    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "used_count")
    private Integer usedCount;

    @Column(length = 50)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Relationships
    @OneToMany(mappedBy = "discountCode", fetch = FetchType.LAZY)
    private List<Order> orders;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.id == null) this.id = java.util.UUID.randomUUID().toString();
        if (this.status == null) this.status = "ACTIVE";
        if (this.usedCount == null) this.usedCount = 0;
    }
}