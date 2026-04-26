package com.example.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
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
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @Column(length = 255)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(length = 50)
    private String status;

    @Column(name = "grand_total", nullable = false)
    private BigDecimal grandTotal;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Column(name = "payment_method", length = 100)
    private String paymentMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_code_id")
    private DiscountCode discountCode;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items;

    @PrePersist
    protected void onCreate() {
        if (this.orderDate == null) this.orderDate = LocalDateTime.now();
        if (this.id == null) this.id = java.util.UUID.randomUUID().toString();
        if (this.status == null) this.status = "PENDING";
    }
}
