package com.example.backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StoreResponse {
    private String id;
    private String name;
    private String status;
    private String ownerName;
    private String ownerEmail;
    private String createdAt;
    private long productCount;
    private long orderCount;
    private BigDecimal totalRevenue;
}
