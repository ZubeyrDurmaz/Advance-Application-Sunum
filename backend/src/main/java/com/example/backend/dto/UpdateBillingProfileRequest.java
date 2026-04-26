package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBillingProfileRequest {

    private String addressId;

    @NotBlank(message = "Account holder name is required")
    @Size(min = 2, max = 100, message = "Account holder name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-\\.,']+$", message = "Account holder name can only contain letters, spaces, and common punctuation")
    private String accountHolderName;

    // Optional address fields for updating address directly
    @Size(max = 50, message = "Address title cannot exceed 50 characters")
    private String addressTitle;

    private String fullAddress;

    @Size(max = 50, message = "City cannot exceed 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-\\.,']+$", message = "City can only contain letters, spaces, and common punctuation")
    private String city;

    @Size(max = 10, message = "Zip code cannot exceed 10 characters")
    private String zipCode;
}