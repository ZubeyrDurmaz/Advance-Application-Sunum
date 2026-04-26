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
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "USER_PAYMENT_METHODS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserPaymentMethod {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;

    @Column(name = "method_type", length = 50)
    @NotBlank(message = "Method type is required")
    @Size(max = 50, message = "Method type cannot exceed 50 characters")
    private String methodType; // "Credit Card", "Digital Wallet"

    @Column(length = 50)
    @Size(max = 50, message = "Provider cannot exceed 50 characters")
    private String provider; // "Visa", "MasterCard", "PayPal"

    @Column(name = "card_token", length = 255)
    @Size(max = 255, message = "Card token cannot exceed 255 characters")
    private String cardToken; // Güvenli ödeme anahtarı

    @Column(name = "last_four", length = 4)
    @Pattern(regexp = "\\d{4}", message = "Last four digits must be exactly 4 digits")
    private String lastFour;

    @Column(name = "expiry_date", length = 7)
    @Pattern(regexp = "(0[1-9]|1[0-2])/\\d{4}", message = "Expiry date must be in MM/YYYY format")
    private String expiryDate; // "MM/YYYY"

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