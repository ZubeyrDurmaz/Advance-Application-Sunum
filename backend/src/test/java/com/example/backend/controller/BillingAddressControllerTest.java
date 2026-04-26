package com.example.backend.controller;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.backend.dto.BillingProfileResponse;
import com.example.backend.dto.CreateBillingAddressRequest;
import com.example.backend.dto.SetBillingAddressRequest;
import com.example.backend.dto.UpdateBillingProfileRequest;
import com.example.backend.dto.UserAddressResponse;
import com.example.backend.service.BillingAddressService;

@ExtendWith(MockitoExtension.class)
class BillingAddressControllerTest {

    @Mock
    private BillingAddressService billingAddressService;

    @InjectMocks
    private BillingAddressController billingAddressController;

    private UserDetails userDetails;
    private BillingProfileResponse testBillingProfile;
    private UserAddressResponse testAddress;
    private SetBillingAddressRequest setBillingRequest;
    private CreateBillingAddressRequest createBillingRequest;
    private UpdateBillingProfileRequest updateBillingRequest;

    @BeforeEach
    void setUp() {
        userDetails = User.builder()
                .username("test@example.com")
                .password("password")
                .authorities("USER")
                .build();

        testAddress = UserAddressResponse.builder()
                .id("address-1")
                .addressTitle("Home")
                .fullAddress("123 Test Street")
                .city("Test City")
                .zipCode("12345")
                .isDefault(true)
                .build();

        testBillingProfile = BillingProfileResponse.builder()
                .id("billing-1")
                .accountHolderName("John Doe")
                .address(testAddress)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        setBillingRequest = SetBillingAddressRequest.builder()
                .addressId("address-1")
                .accountHolderName("John Doe")
                .build();

        createBillingRequest = CreateBillingAddressRequest.builder()
                .addressTitle("Billing Address")
                .fullAddress("456 Billing Street")
                .city("Billing City")
                .zipCode("67890")
                .accountHolderName("John Doe")
                .build();

        updateBillingRequest = UpdateBillingProfileRequest.builder()
                .accountHolderName("John Smith")
                .addressId("address-2")
                .build();
    }

    @Test
    void getBillingProfile_ShouldReturnBillingProfile_WhenExists() {
        // Given
        when(billingAddressService.getBillingProfile("test@example.com"))
                .thenReturn(Optional.of(testBillingProfile));

        // When
        ResponseEntity<BillingProfileResponse> response = billingAddressController.getBillingProfile(userDetails);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("billing-1", response.getBody().getId());
        assertEquals("John Doe", response.getBody().getAccountHolderName());
        verify(billingAddressService).getBillingProfile("test@example.com");
    }

    @Test
    void getBillingProfile_ShouldReturnNotFound_WhenNotExists() {
        // Given
        when(billingAddressService.getBillingProfile("test@example.com"))
                .thenReturn(Optional.empty());

        // When
        ResponseEntity<BillingProfileResponse> response = billingAddressController.getBillingProfile(userDetails);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(billingAddressService).getBillingProfile("test@example.com");
    }

    @Test
    void setBillingAddress_ShouldReturnBillingProfile() {
        // Given
        when(billingAddressService.setBillingAddress(eq("test@example.com"), any(SetBillingAddressRequest.class)))
                .thenReturn(testBillingProfile);

        // When
        ResponseEntity<BillingProfileResponse> response = billingAddressController.setBillingAddress(userDetails, setBillingRequest);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("billing-1", response.getBody().getId());
        assertEquals("John Doe", response.getBody().getAccountHolderName());
        verify(billingAddressService).setBillingAddress("test@example.com", setBillingRequest);
    }

    @Test
    void createBillingAddress_ShouldReturnBillingProfile() {
        // Given
        when(billingAddressService.createBillingAddress(eq("test@example.com"), any(CreateBillingAddressRequest.class)))
                .thenReturn(testBillingProfile);

        // When
        ResponseEntity<BillingProfileResponse> response = billingAddressController.createBillingAddress(userDetails, createBillingRequest);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("billing-1", response.getBody().getId());
        assertEquals("John Doe", response.getBody().getAccountHolderName());
        verify(billingAddressService).createBillingAddress("test@example.com", createBillingRequest);
    }

    @Test
    void updateBillingProfile_ShouldReturnUpdatedProfile() {
        // Given
        BillingProfileResponse updatedProfile = BillingProfileResponse.builder()
                .id("billing-1")
                .accountHolderName("John Smith")
                .address(testAddress)
                .createdAt(testBillingProfile.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();

        when(billingAddressService.updateBillingProfile(eq("test@example.com"), any(UpdateBillingProfileRequest.class)))
                .thenReturn(updatedProfile);

        // When
        ResponseEntity<BillingProfileResponse> response = billingAddressController.updateBillingProfile(userDetails, updateBillingRequest);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("billing-1", response.getBody().getId());
        assertEquals("John Smith", response.getBody().getAccountHolderName());
        verify(billingAddressService).updateBillingProfile("test@example.com", updateBillingRequest);
    }

    @Test
    void clearBillingAddress_ShouldReturnOk() {
        // Given
        doNothing().when(billingAddressService).clearBillingAddress("test@example.com");

        // When
        ResponseEntity<Void> response = billingAddressController.clearBillingAddress(userDetails);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(billingAddressService).clearBillingAddress("test@example.com");
    }

    @Test
    void getAvailableAddresses_ShouldReturnAddressList() {
        // Given
        UserAddressResponse address2 = UserAddressResponse.builder()
                .id("address-2")
                .addressTitle("Work")
                .fullAddress("789 Work Avenue")
                .city("Work City")
                .zipCode("54321")
                .isDefault(false)
                .build();

        List<UserAddressResponse> addresses = Arrays.asList(testAddress, address2);
        when(billingAddressService.getAvailableAddressesForBilling("test@example.com"))
                .thenReturn(addresses);

        // When
        ResponseEntity<List<UserAddressResponse>> response = billingAddressController.getAvailableAddresses(userDetails);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("address-1", response.getBody().get(0).getId());
        assertEquals("address-2", response.getBody().get(1).getId());
        verify(billingAddressService).getAvailableAddressesForBilling("test@example.com");
    }
}