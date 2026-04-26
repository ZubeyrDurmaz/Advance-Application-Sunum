package com.example.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.BillingProfileResponse;
import com.example.backend.dto.CreateBillingAddressRequest;
import com.example.backend.dto.SetBillingAddressRequest;
import com.example.backend.dto.UpdateBillingProfileRequest;
import com.example.backend.dto.UserAddressResponse;
import com.example.backend.service.BillingAddressService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/me/billing")
@RequiredArgsConstructor
public class BillingAddressController {

    private final BillingAddressService billingAddressService;

    /**
     * Get user's current billing profile
     * GET /api/users/me/billing/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<BillingProfileResponse> getBillingProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        Optional<BillingProfileResponse> billingProfile = billingAddressService.getBillingProfile(userDetails.getUsername());
        return billingProfile
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Set existing address as billing address
     * POST /api/users/me/billing/set-address
     */
    @PostMapping("/set-address")
    public ResponseEntity<BillingProfileResponse> setBillingAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SetBillingAddressRequest request) {
        BillingProfileResponse billingProfile = billingAddressService.setBillingAddress(userDetails.getUsername(), request);
        return ResponseEntity.ok(billingProfile);
    }

    /**
     * Create new address and set as billing
     * POST /api/users/me/billing/create-address
     */
    @PostMapping("/create-address")
    public ResponseEntity<BillingProfileResponse> createBillingAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateBillingAddressRequest request) {
        BillingProfileResponse billingProfile = billingAddressService.createBillingAddress(userDetails.getUsername(), request);
        return ResponseEntity.ok(billingProfile);
    }

    /**
     * Update billing profile (address and account holder)
     * PUT /api/users/me/billing/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<BillingProfileResponse> updateBillingProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateBillingProfileRequest request) {
        BillingProfileResponse billingProfile = billingAddressService.updateBillingProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(billingProfile);
    }

    /**
     * Clear billing address
     * DELETE /api/users/me/billing/profile
     */
    @DeleteMapping("/profile")
    public ResponseEntity<Void> clearBillingAddress(
            @AuthenticationPrincipal UserDetails userDetails) {
        billingAddressService.clearBillingAddress(userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    /**
     * Get addresses available for billing selection
     * GET /api/users/me/billing/available-addresses
     */
    @GetMapping("/available-addresses")
    public ResponseEntity<List<UserAddressResponse>> getAvailableAddresses(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<UserAddressResponse> addresses = billingAddressService.getAvailableAddressesForBilling(userDetails.getUsername());
        return ResponseEntity.ok(addresses);
    }
}