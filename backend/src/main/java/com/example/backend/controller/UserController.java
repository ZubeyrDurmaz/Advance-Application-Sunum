package com.example.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.CategorySpendingResponse;
import com.example.backend.dto.ChangePasswordRequest;
import com.example.backend.dto.DashboardStatsResponse;
import com.example.backend.dto.MonthlyActivityResponse;
import com.example.backend.dto.UpdateProfileRequest;
import com.example.backend.dto.UserAddressRequest;
import com.example.backend.dto.UserAddressResponse;
import com.example.backend.dto.UserPaymentMethodRequest;
import com.example.backend.dto.UserPaymentMethodResponse;
import com.example.backend.dto.UserProfileResponse;
import com.example.backend.service.UserAddressService;
import com.example.backend.service.UserPaymentMethodService;
import com.example.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserAddressService userAddressService;
    private final UserPaymentMethodService userPaymentMethodService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getUsername()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getDashboardStats(userDetails.getUsername()));
    }

    @GetMapping("/me/analytics/spending-by-category")
    public ResponseEntity<List<CategorySpendingResponse>> getSpendingByCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(userService.getSpendingByCategory(userDetails.getUsername(), year));
    }

    @GetMapping("/me/analytics/monthly-activity")
    public ResponseEntity<List<MonthlyActivityResponse>> getMonthlyActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(userService.getMonthlyActivity(userDetails.getUsername(), year));
    }

    // ==================== ADDRESS ENDPOINTS ====================
    
    @GetMapping("/me/addresses")
    public ResponseEntity<List<UserAddressResponse>> getUserAddresses(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<UserAddressResponse> addresses = userAddressService.getUserAddresses(userDetails.getUsername());
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<UserAddressResponse> createAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserAddressRequest request) {
        UserAddressResponse address = userAddressService.createAddress(userDetails.getUsername(), request);
        return ResponseEntity.ok(address);
    }

    @GetMapping("/me/addresses/{id}")
    public ResponseEntity<UserAddressResponse> getAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        UserAddressResponse address = userAddressService.getAddressById(userDetails.getUsername(), id);
        return ResponseEntity.ok(address);
    }

    @PutMapping("/me/addresses/{id}")
    public ResponseEntity<UserAddressResponse> updateAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody UserAddressRequest request) {
        UserAddressResponse address = userAddressService.updateAddress(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(address);
    }

    @DeleteMapping("/me/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        userAddressService.deleteAddress(userDetails.getUsername(), id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/me/addresses/{id}/set-default")
    public ResponseEntity<UserAddressResponse> setDefaultAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        UserAddressResponse address = userAddressService.setDefaultAddress(userDetails.getUsername(), id);
        return ResponseEntity.ok(address);
    }

    // ==================== PAYMENT METHOD ENDPOINTS ====================
    
    @GetMapping("/me/payment-methods")
    public ResponseEntity<List<UserPaymentMethodResponse>> getUserPaymentMethods(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<UserPaymentMethodResponse> paymentMethods = userPaymentMethodService.getUserPaymentMethods(userDetails.getUsername());
        return ResponseEntity.ok(paymentMethods);
    }

    @PostMapping("/me/payment-methods")
    public ResponseEntity<UserPaymentMethodResponse> createPaymentMethod(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserPaymentMethodRequest request) {
        UserPaymentMethodResponse paymentMethod = userPaymentMethodService.createPaymentMethod(userDetails.getUsername(), request);
        return ResponseEntity.ok(paymentMethod);
    }

    @GetMapping("/me/payment-methods/{id}")
    public ResponseEntity<UserPaymentMethodResponse> getPaymentMethod(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        UserPaymentMethodResponse paymentMethod = userPaymentMethodService.getPaymentMethodById(userDetails.getUsername(), id);
        return ResponseEntity.ok(paymentMethod);
    }

    @PutMapping("/me/payment-methods/{id}")
    public ResponseEntity<UserPaymentMethodResponse> updatePaymentMethod(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody UserPaymentMethodRequest request) {
        UserPaymentMethodResponse paymentMethod = userPaymentMethodService.updatePaymentMethod(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(paymentMethod);
    }

    @DeleteMapping("/me/payment-methods/{id}")
    public ResponseEntity<Void> deletePaymentMethod(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        userPaymentMethodService.deletePaymentMethod(userDetails.getUsername(), id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/me/payment-methods/{id}/set-default")
    public ResponseEntity<UserPaymentMethodResponse> setDefaultPaymentMethod(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        UserPaymentMethodResponse paymentMethod = userPaymentMethodService.setDefaultPaymentMethod(userDetails.getUsername(), id);
        return ResponseEntity.ok(paymentMethod);
    }
}
