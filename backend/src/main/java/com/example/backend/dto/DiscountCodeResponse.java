package com.example.backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DiscountCodeResponse {
    private String id;
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private String validFrom;
    private String validUntil;
    private Integer maxUses;
    private Integer usedCount;
    private String status;
    private String storeName;
    private String createdAt;
}
