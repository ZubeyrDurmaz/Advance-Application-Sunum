package com.example.backend.controller;

import com.example.backend.dto.ApplyDiscountRequest;
import com.example.backend.dto.DiscountValidationResponse;
import com.example.backend.entity.DiscountCode;
import com.example.backend.service.DiscountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
@Slf4j
public class DiscountController {

    private final DiscountService discountService;

    /**
     * Validate and apply discount code
     * POST /api/discounts/validate
     */
    @PostMapping("/validate")
    public ResponseEntity<DiscountValidationResponse> validateDiscount(@RequestBody ApplyDiscountRequest request) {
        log.info("Validating discount code: {}", request.getCode());
        DiscountValidationResponse response = discountService.validateAndApplyDiscount(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all active discount codes (Admin only)
     * GET /api/discounts/active
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DiscountCode>> getActiveDiscounts() {
        log.info("Fetching all active discount codes");
        List<DiscountCode> discounts = discountService.getAllActiveDiscounts();
        return ResponseEntity.ok(discounts);
    }

    /**
     * Get discount code details by code (Admin only)
     * GET /api/discounts/{code}
     */
    @GetMapping("/{code}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDiscountByCode(@PathVariable String code) {
        log.info("Fetching discount code: {}", code);
        return discountService.getDiscountByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
