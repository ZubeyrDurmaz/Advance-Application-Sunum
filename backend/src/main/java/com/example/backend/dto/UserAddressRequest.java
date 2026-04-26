package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAddressRequest {

    @Size(max = 50, message = "Address title cannot exceed 50 characters")
    private String addressTitle;

    @NotBlank(message = "Full address is required")
    private String fullAddress;

    @NotBlank(message = "City is required")
    @Size(max = 50, message = "City cannot exceed 50 characters")
    private String city;

    @Size(max = 10, message = "Zip code cannot exceed 10 characters")
    private String zipCode;

    @Builder.Default
    private Boolean isDefault = false;
}