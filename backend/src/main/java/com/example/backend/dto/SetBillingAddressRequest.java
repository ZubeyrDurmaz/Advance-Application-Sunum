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
public class SetBillingAddressRequest {

    @NotBlank(message = "Address ID is required")
    private String addressId;

    @NotBlank(message = "Account holder name is required")
    @Size(min = 2, max = 100, message = "Account holder name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-\\.,']+$", message = "Account holder name can only contain letters, spaces, and common punctuation")
    private String accountHolderName;
}