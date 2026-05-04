package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.StripeService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
@Slf4j
public class StripeController {

    private final StripeService stripeService;

    /**
     * Create a Checkout Session
     * POST /api/stripe/checkout-session
     */
    @PostMapping("/checkout-session")
    public ResponseEntity<?> createCheckoutSession(@RequestBody CreateCheckoutSessionRequest request) {
        try {
            StripeResponse response = stripeService.createCheckoutSession(request);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            log.error("Error creating checkout session", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create a Payment Intent
     * POST /api/stripe/payment-intent
     */
    @PostMapping("/payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody CreatePaymentIntentRequest request) {
        try {
            StripeResponse response = stripeService.createPaymentIntent(request);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            log.error("Error creating payment intent", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get Payment Intent status
     * GET /api/stripe/payment-intent/{id}
     */
    @GetMapping("/payment-intent/{id}")
    public ResponseEntity<?> getPaymentIntent(@PathVariable String id) {
        try {
            StripeResponse response = stripeService.getPaymentIntent(id);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            log.error("Error retrieving payment intent", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create a Refund
     * POST /api/stripe/refund
     */
    @PostMapping("/refund")
    public ResponseEntity<?> createRefund(@RequestBody RefundRequest request) {
        try {
            StripeResponse response = stripeService.createRefund(request);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            log.error("Error creating refund", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Stripe Webhook Endpoint
     * POST /api/stripe/webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            String result = stripeService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (StripeException e) {
            log.error("Error processing webhook", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * List Payment Intents
     * GET /api/stripe/payment-intents?customerEmail=xxx&limit=10
     */
    @GetMapping("/payment-intents")
    public ResponseEntity<?> listPaymentIntents(
            @RequestParam(required = false) String customerEmail,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            Map<String, Object> response = stripeService.listPaymentIntents(customerEmail, limit);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            log.error("Error listing payment intents", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Health check endpoint
     * GET /api/stripe/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "Stripe Payment Service",
                "message", "Stripe integration is running"
        ));
    }
}
