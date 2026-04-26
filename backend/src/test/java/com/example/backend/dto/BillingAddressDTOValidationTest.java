package com.example.backend.dto;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class BillingAddressDTOValidationTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testSetBillingAddressRequest_ValidData() {
        SetBillingAddressRequest request = SetBillingAddressRequest.builder()
                .addressId("address-123")
                .accountHolderName("John Doe")
                .build();

        Set<ConstraintViolation<SetBillingAddressRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testSetBillingAddressRequest_InvalidData() {
        SetBillingAddressRequest request = SetBillingAddressRequest.builder()
                .addressId("")  // Empty address ID
                .accountHolderName("J")  // Too short
                .build();

        Set<ConstraintViolation<SetBillingAddressRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertEquals(2, violations.size());
    }

    @Test
    void testCreateBillingAddressRequest_ValidData() {
        CreateBillingAddressRequest request = CreateBillingAddressRequest.builder()
                .addressTitle("Home")
                .fullAddress("123 Main Street")
                .city("Test City")
                .zipCode("12345")
                .accountHolderName("John Doe")
                .build();

        Set<ConstraintViolation<CreateBillingAddressRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testCreateBillingAddressRequest_InvalidData() {
        CreateBillingAddressRequest request = CreateBillingAddressRequest.builder()
                .fullAddress("")  // Empty address
                .city("")  // Empty city
                .accountHolderName("")  // Empty account holder
                .build();

        Set<ConstraintViolation<CreateBillingAddressRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.size() >= 3);
    }

    @Test
    void testUpdateBillingProfileRequest_ValidData() {
        UpdateBillingProfileRequest request = UpdateBillingProfileRequest.builder()
                .accountHolderName("John Smith")
                .addressId("address-456")
                .build();

        Set<ConstraintViolation<UpdateBillingProfileRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testAccountHolderNamePattern_InvalidCharacters() {
        SetBillingAddressRequest request = SetBillingAddressRequest.builder()
                .addressId("address-123")
                .accountHolderName("John123")  // Contains numbers
                .build();

        Set<ConstraintViolation<SetBillingAddressRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("can only contain letters, spaces, and common punctuation")));
    }

    @Test
    void testCityPattern_InvalidCharacters() {
        CreateBillingAddressRequest request = CreateBillingAddressRequest.builder()
                .fullAddress("123 Main Street")
                .city("Test123")  // Contains numbers
                .accountHolderName("John Doe")
                .build();

        Set<ConstraintViolation<CreateBillingAddressRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("can only contain letters, spaces, and common punctuation")));
    }
}