package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPaymentMethodRequest {

    @NotBlank(message = "Method type is required")
    @Size(max = 50, message = "Method type cannot exceed 50 characters")
    private String methodType; // "Credit Card", "Digital Wallet"

    @Size(max = 50, message = "Provider cannot exceed 50 characters")
    private String provider; // "Visa", "MasterCard", "PayPal"

    @Size(max = 255, message = "Card token cannot exceed 255 characters")
    private String cardToken; // Güvenli ödeme anahtarı

    @Pattern(regexp = "\\d{4}", message = "Last four digits must be exactly 4 digits")
    private String lastFour;

    @Pattern(regexp = "(0[1-9]|1[0-2])/\\d{4}", message = "Expiry date must be in MM/YYYY format")
    private String expiryDate; // "MM/YYYY"

    @Builder.Default
    private Boolean isDefault = false;
}