package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "USER_ADDRESSES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserAddress {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;

    @Column(name = "address_title", length = 50)
    @Size(max = 50, message = "Address title cannot exceed 50 characters")
    private String addressTitle;

    @Column(name = "full_address", columnDefinition = "TEXT")
    @NotBlank(message = "Full address is required")
    private String fullAddress;

    @Column(length = 50)
    @NotBlank(message = "City is required")
    @Size(max = 50, message = "City cannot exceed 50 characters")
    private String city;

    @Column(name = "zip_code", length = 10)
    @Size(max = 10, message = "Zip code cannot exceed 10 characters")
    private String zipCode;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
        if (this.isDefault == null) {
            this.isDefault = false;
        }
    }
}