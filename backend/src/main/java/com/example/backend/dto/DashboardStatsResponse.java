package com.example.backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStatsResponse {
    private long orderCount;
    private BigDecimal totalSpent;
    private String memberSince;
    private String lastOrderDate;
    private String membershipType;
    private long addressCount;
    private long paymentMethodCount;
    private long cartItemCount;
    private boolean hasDefaultAddress;
    private boolean hasDefaultPaymentMethod;
}
