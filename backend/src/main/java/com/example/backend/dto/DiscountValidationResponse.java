package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountValidationResponse {
    private boolean valid;
    private String code;
    private String discountType; // PERCENTAGE, FIXED_AMOUNT
    private Double discountValue;
    private Long originalAmount;
    private Long discountAmount;
    private Long finalAmount;
    private String message;
    private String errorMessage;
}
