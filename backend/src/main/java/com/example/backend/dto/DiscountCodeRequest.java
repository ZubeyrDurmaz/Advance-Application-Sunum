package com.example.backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class DiscountCodeRequest {
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private String validFrom;
    private String validUntil;
    private Integer maxUses;
    private String storeId;
}
