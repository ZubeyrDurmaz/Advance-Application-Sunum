package com.example.backend.entity;

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
@Table(name = "distributors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Distributor {

    @Id
    @Column(length = 255)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 100)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(length = 50)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Relationships
    @OneToMany(mappedBy = "distributor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductLocation> productLocations;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.id == null) this.id = java.util.UUID.randomUUID().toString();
        if (this.status == null) this.status = "ACTIVE";
    }
}
