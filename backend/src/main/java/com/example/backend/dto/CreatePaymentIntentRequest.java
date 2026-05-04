package com.example.backend.dto;

import lombok.Data;

@Data
public class CreatePaymentIntentRequest {
    private Long amount; // in cents
    private String currency;
    private String customerEmail;
    private String description;
    private String orderId;
    private String discountCode; // Discount code to apply
}
