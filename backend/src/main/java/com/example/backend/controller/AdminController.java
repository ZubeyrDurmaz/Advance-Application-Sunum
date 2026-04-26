package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final com.example.backend.service.AuditLogService auditLogService;

    // ── Users ──

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<AdminUserResponse> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.updateUserRole(id, body.get("role")));
    }

    // ── Stores ──

    @GetMapping("/stores")
    public ResponseEntity<List<StoreResponse>> getAllStores() {
        return ResponseEntity.ok(adminService.getAllStores());
    }

    @PutMapping("/stores/{id}/status")
    public ResponseEntity<StoreResponse> updateStoreStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.updateStoreStatus(id, body.get("status")));
    }

    @GetMapping("/analytics")
    public ResponseEntity<PlatformAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(adminService.getPlatformAnalytics());
    }

    @GetMapping("/logs")
    public ResponseEntity<List<com.example.backend.dto.AuditLogResponse>> getLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    @GetMapping("/logs/csv")
    public ResponseEntity<byte[]> getLogsCsv() {
        String csv = com.example.backend.util.CsvExportUtil.exportLogsToCsv(auditLogService.getAllLogs());
        byte[] bytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"audit_logs.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    // ── Orders ──

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.updateOrderStatus(id, body.get("status")));
    }

    // ── Discount Codes ──

    @GetMapping("/discounts")
    public ResponseEntity<List<DiscountCodeResponse>> getAllDiscounts() {
        return ResponseEntity.ok(adminService.getAllDiscounts());
    }

    @PostMapping("/discounts")
    public ResponseEntity<DiscountCodeResponse> createDiscount(@RequestBody DiscountCodeRequest request) {
        return ResponseEntity.ok(adminService.createDiscount(request));
    }

    @PutMapping("/discounts/{id}")
    public ResponseEntity<DiscountCodeResponse> updateDiscount(
            @PathVariable String id, @RequestBody DiscountCodeRequest request) {
        return ResponseEntity.ok(adminService.updateDiscount(id, request));
    }

    @DeleteMapping("/discounts/{id}")
    public ResponseEntity<Void> deleteDiscount(@PathVariable String id) {
        adminService.deleteDiscount(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/discounts/{id}/toggle")
    public ResponseEntity<DiscountCodeResponse> toggleDiscount(@PathVariable String id) {
        return ResponseEntity.ok(adminService.toggleDiscount(id));
    }

    // ── Products ──

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(adminService.getAllProducts());
    }

    @GetMapping("/products/csv")
    public ResponseEntity<byte[]> getProductsCsv() {
        String csv = com.example.backend.util.CsvExportUtil.exportProductsToCsv(adminService.getAllProducts());
        byte[] bytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"products.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable String id, @RequestBody ProductRequest request) {
        return ResponseEntity.ok(adminService.updateProduct(id, request));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        adminService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
