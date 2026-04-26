package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customer_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerProfile {

    @Id
    @Column(length = 255)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer age;

    @Column(length = 100)
    private String city;

    @Column(name = "membership_type", length = 50)
    private String membershipType;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) this.id = java.util.UUID.randomUUID().toString();
    }
}
