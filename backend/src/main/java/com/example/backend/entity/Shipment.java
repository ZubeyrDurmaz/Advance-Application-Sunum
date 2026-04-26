package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shipments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Shipment {

    @Id
    @Column(length = 255)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(length = 255)
    private String warehouse;

    @Column(length = 100)
    private String mode;

    @Column(length = 50)
    private String status;

    @Column(name = "tracking_number", length = 255)
    private String trackingNumber;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) this.id = java.util.UUID.randomUUID().toString();
        if (this.status == null) this.status = "PROCESSING";
    }
}
