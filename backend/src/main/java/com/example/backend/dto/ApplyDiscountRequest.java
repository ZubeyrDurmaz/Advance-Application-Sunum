package com.example.backend.dto;

import lombok.Data;

@Data
public class ApplyDiscountRequest {
    private String code;
    private Long originalAmount; // in cents
}
