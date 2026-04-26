package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAddressResponse {

    private String id;
    private String addressTitle;
    private String fullAddress;
    private String city;
    private String zipCode;
    private Boolean isDefault;
}