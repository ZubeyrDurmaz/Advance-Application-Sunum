package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripeResponse {
    private String id;
    private String status;
    private String clientSecret;
    private String url;
    private Long amount;
    private String currency;
    private String message;
}
