package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.backend.dto.ApplyDiscountRequest;
import com.example.backend.dto.DiscountValidationResponse;
import com.example.backend.entity.DiscountCode;
import com.example.backend.repository.DiscountCodeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscountService {

    private final DiscountCodeRepository discountCodeRepository;

    /**
     * Validate and apply discount code
     */
    public DiscountValidationResponse validateAndApplyDiscount(ApplyDiscountRequest request) {
        log.info("Validating discount code: {}", request.getCode());

        // Find discount code
        Optional<DiscountCode> discountOpt = discountCodeRepository.findByCode(request.getCode());

        if (discountOpt.isEmpty()) {
            return DiscountValidationResponse.builder()
                    .valid(false)
                    .code(request.getCode())
                    .originalAmount(request.getOriginalAmount())
                    .finalAmount(request.getOriginalAmount())
                    .errorMessage("Invalid discount code")
                    .build();
        }

        DiscountCode discount = discountOpt.get();

        // Check if active
        if (!"ACTIVE".equals(discount.getStatus())) {
            return DiscountValidationResponse.builder()
                    .valid(false)
                    .code(request.getCode())
                    .originalAmount(request.getOriginalAmount())
                    .finalAmount(request.getOriginalAmount())
                    .errorMessage("This discount code is no longer active")
                    .build();
        }

        // Check expiration
        if (discount.getValidUntil() != null && discount.getValidUntil().isBefore(LocalDateTime.now())) {
            return DiscountValidationResponse.builder()
                    .valid(false)
                    .code(request.getCode())
                    .originalAmount(request.getOriginalAmount())
                    .finalAmount(request.getOriginalAmount())
                    .errorMessage("This discount code has expired")
                    .build();
        }

        // Check usage limit
        if (discount.getMaxUses() != null && discount.getUsedCount() >= discount.getMaxUses()) {
            return DiscountValidationResponse.builder()
                    .valid(false)
                    .code(request.getCode())
                    .originalAmount(request.getOriginalAmount())
                    .finalAmount(request.getOriginalAmount())
                    .errorMessage("This discount code has reached its usage limit")
                    .build();
        }

        // Calculate discount
        long discountAmount = calculateDiscountAmount(discount, request.getOriginalAmount());
        long finalAmount = Math.max(0, request.getOriginalAmount() - discountAmount);

        String message = String.format("Discount applied: %s", 
                discount.getDiscountType().equals("PERCENTAGE") 
                    ? discount.getDiscountValue().doubleValue() + "% off"
                    : "$" + (discount.getDiscountValue().doubleValue() / 100.0) + " off");

        return DiscountValidationResponse.builder()
                .valid(true)
                .code(discount.getCode())
                .discountType(discount.getDiscountType())
                .discountValue(discount.getDiscountValue().doubleValue())
                .originalAmount(request.getOriginalAmount())
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .message(message)
                .build();
    }

    /**
     * Calculate discount amount based on type
     */
    private long calculateDiscountAmount(DiscountCode discount, long originalAmount) {
        if (discount.getDiscountType().equals("PERCENTAGE")) {
            // Percentage discount
            return (long) (originalAmount * (discount.getDiscountValue().doubleValue() / 100.0));
        } else {
            // Fixed amount discount (already in cents)
            return discount.getDiscountValue().longValue();
        }
    }

    /**
     * Increment usage count after successful payment
     * Automatically deactivates discount if max uses reached
     */
    public void incrementUsageCount(String code) {
        log.info("Incrementing usage count for discount code: {}", code);
        
        discountCodeRepository.findByCode(code).ifPresent(discount -> {
            discount.setUsedCount(discount.getUsedCount() + 1);
            
            // Check if max uses reached and auto-deactivate
            if (discount.getMaxUses() != null && discount.getUsedCount() >= discount.getMaxUses()) {
                discount.setStatus("INACTIVE");
                log.warn("Discount code {} has reached max uses ({}/{}). Auto-deactivating.", 
                        code, discount.getUsedCount(), discount.getMaxUses());
            }
            
            discountCodeRepository.save(discount);
            log.info("Usage count updated for code {}: {}/{} - Status: {}", 
                    code, discount.getUsedCount(), discount.getMaxUses(), discount.getStatus());
        });
    }

    /**
     * Get all active discount codes (for admin)
     */
    public java.util.List<DiscountCode> getAllActiveDiscounts() {
        return discountCodeRepository.findByStatus("ACTIVE");
    }

    /**
     * Get discount code details
     */
    public Optional<DiscountCode> getDiscountByCode(String code) {
        return discountCodeRepository.findByCode(code);
    }
}
