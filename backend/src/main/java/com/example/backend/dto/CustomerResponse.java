package com.example.backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CustomerResponse {
    private String id;
    private String name;
    private String email;
    private long orderCount;
    private BigDecimal totalSpent;
    private String lastOrderDate;
}
