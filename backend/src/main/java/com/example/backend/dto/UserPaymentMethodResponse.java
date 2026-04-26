package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPaymentMethodResponse {

    private String id;
    private String methodType;
    private String provider;
    private String lastFour; // Sadece son 4 hane, güvenlik için
    private String expiryDate;
    private Boolean isDefault;
    
    // cardToken asla response'da döndürülmez - güvenlik
}