package com.example.backend.dto;

import lombok.Data;

@Data
public class RefundRequest {
    private String paymentIntentId;
    private Long amount; // in cents, optional (full refund if null)
    private String reason; // duplicate, fraudulent, requested_by_customer
}
