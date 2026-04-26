package com.example.backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySpendingResponse {
    private String categoryName;
    private BigDecimal totalSpent;
    private Double percentage;
}
