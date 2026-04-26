package com.example.backend.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @Column(length = 255)
    private String id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "password", length = 255, nullable = false)
    private String password;

    @Column(name = "role_type", length = 50, nullable = false)
    private String roleType;

    @Column(name = "role", length = 255, nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(length = 50)
    private String gender;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(nullable = false, length = 255)
    private String name;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserAddress> addresses;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserPaymentMethod> paymentMethods;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.id == null) this.id = java.util.UUID.randomUUID().toString();
        if (this.roleType == null && this.role != null) this.roleType = this.role.name();
    }
}
