package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.CorporateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/corporate")
@RequiredArgsConstructor
public class CorporateController {

    private final CorporateService corporateService;

    // ── Store ──

    @GetMapping("/store")
    public ResponseEntity<StoreResponse> getStore(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(corporateService.getMyStore(u.getUsername()));
    }

    @PutMapping("/store")
    public ResponseEntity<StoreResponse> updateStore(
            @AuthenticationPrincipal UserDetails u,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(corporateService.updateMyStore(u.getUsername(), body.get("name")));
    }

    // ── Products / Inventory ──

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getProducts(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(corporateService.getMyProducts(u.getUsername()));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(
            @AuthenticationPrincipal UserDetails u,
            @RequestBody ProductRequest request) {
        return ResponseEntity.ok(corporateService.createProduct(u.getUsername(), request));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable String id,
            @RequestBody ProductRequest request) {
        return ResponseEntity.ok(corporateService.updateProduct(u.getUsername(), id, request));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable String id) {
        corporateService.deleteProduct(u.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    // ── Orders ──

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getOrders(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(corporateService.getMyOrders(u.getUsername()));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable String id,
            @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(corporateService.updateOrderStatus(u.getUsername(), id, request.getStatus()));
    }

    // ── Customers ──

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerResponse>> getCustomers(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(corporateService.getMyCustomers(u.getUsername()));
    }

    // ── Reviews ──

    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewResponse>> getReviews(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(corporateService.getMyReviews(u.getUsername()));
    }

    // ── Analytics ──

    @GetMapping("/analytics")
    public ResponseEntity<CorporateAnalyticsResponse> getAnalytics(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(corporateService.getAnalytics(u.getUsername()));
    }
}
