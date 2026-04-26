package com.example.backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CorporateAnalyticsResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalProducts;
    private long totalCustomers;
    private long totalReviews;
    private double averageStoreRating;
    private List<MonthlyStat> monthlySales;
    private List<TopProduct> topProducts;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyStat {
        private String month;
        private BigDecimal revenue;
        private long orders;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TopProduct {
        private String name;
        private long unitsSold;
        private BigDecimal revenue;
        private double averageRating;
    }
}
