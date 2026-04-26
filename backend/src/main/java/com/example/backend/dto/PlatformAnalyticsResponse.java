package com.example.backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlatformAnalyticsResponse {
    private long totalUsers;
    private long totalStores;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private List<CorporateAnalyticsResponse.MonthlyStat> monthlyRevenue;
    private List<TopStore> topStores;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TopStore {
        private String name;
        private long orders;
        private BigDecimal revenue;
    }
}
