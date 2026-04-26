package com.example.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingProfileResponse {

    private String id;
    private String accountHolderName;
    private UserAddressResponse address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}