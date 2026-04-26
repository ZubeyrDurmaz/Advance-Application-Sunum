package com.example.backend.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class OrderStatusUpdateRequest {
    private String status;
}
