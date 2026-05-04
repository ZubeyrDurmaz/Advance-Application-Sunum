package com.example.backend.service;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.backend.dto.ApplyDiscountRequest;
import com.example.backend.dto.CreateCheckoutSessionRequest;
import com.example.backend.dto.CreatePaymentIntentRequest;
import com.example.backend.dto.DiscountValidationResponse;
import com.example.backend.dto.RefundRequest;
import com.example.backend.dto.StripeResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentIntentCollection;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentListParams;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.checkout.SessionCreateParams;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class StripeService {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    private final DiscountService discountService;

    public StripeService(DiscountService discountService) {
        this.discountService = discountService;
    }

    /**
     * Create a Checkout Session for hosted payment page with discount support
     */
    public StripeResponse createCheckoutSession(CreateCheckoutSessionRequest request) throws StripeException {
        log.info("Creating Stripe Checkout Session for {} items", request.getItems().size());
        log.info("Success URL: {}", request.getSuccessUrl());
        log.info("Cancel URL: {}", request.getCancelUrl());

        // Calculate total amount for discount validation
        long totalAmount = request.getItems().stream()
                .mapToLong(item -> item.getAmount() * item.getQuantity())
                .sum();

        // Validate and apply discount if provided
        long discountAmount = 0;
        if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank()) {
            log.info("Validating discount code: {}", request.getDiscountCode());
            try {
                ApplyDiscountRequest applyReq = new ApplyDiscountRequest();
                applyReq.setCode(request.getDiscountCode());
                applyReq.setOriginalAmount(totalAmount);
                DiscountValidationResponse discountResponse = discountService.validateAndApplyDiscount(applyReq);
                if (discountResponse.isValid()) {
                    discountAmount = discountResponse.getDiscountAmount();
                    log.info("Discount applied: {} cents", discountAmount);
                } else {
                    log.warn("Invalid discount code: {}", request.getDiscountCode());
                }
            } catch (Exception e) {
                log.error("Error validating discount code", e);
            }
        }

        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(request.getSuccessUrl())
                .setCancelUrl(request.getCancelUrl());

        // Add customer email if provided
        if (request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()) {
            paramsBuilder.setCustomerEmail(request.getCustomerEmail());
        }

        // Add metadata (including discount code and shipping address)
        if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank()) {
            paramsBuilder.putMetadata("discount_code", request.getDiscountCode());
            paramsBuilder.putMetadata("discount_amount", String.valueOf(discountAmount));
        }
        
        // Add shipping address metadata if provided
        if (request.getMetadata() != null) {
            request.getMetadata().forEach((key, value) -> {
                if (value != null) {
                    paramsBuilder.putMetadata(key, value.toString());
                }
            });
        }

        // Add line items with discount applied proportionally
        if (discountAmount > 0 && !request.getItems().isEmpty()) {
            // Apply discount proportionally to all items
            long remainingDiscount = discountAmount;
            int itemCount = request.getItems().size();
            
            for (int i = 0; i < request.getItems().size(); i++) {
                CreateCheckoutSessionRequest.CheckoutItem item = request.getItems().get(i);
                long itemTotal = item.getAmount() * item.getQuantity();
                
                // Calculate proportional discount for this item
                long itemDiscount;
                if (i == itemCount - 1) {
                    // Last item gets remaining discount to handle rounding
                    itemDiscount = remainingDiscount;
                } else {
                    itemDiscount = (discountAmount * itemTotal) / totalAmount;
                    remainingDiscount -= itemDiscount;
                }
                
                // Calculate discounted price per unit
                long discountedTotal = Math.max(0, itemTotal - itemDiscount);
                long discountedUnitPrice = discountedTotal / item.getQuantity();
                
                SessionCreateParams.LineItem.PriceData.ProductData.Builder productBuilder1 =
                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                .setName(item.getName())
                                .putMetadata("product_id", item.getProductId())
                                .putMetadata("original_price", String.valueOf(item.getAmount()));
                if (item.getImageUrl() != null && !item.getImageUrl().isBlank()) {
                    productBuilder1.addImage(item.getImageUrl());
                }
                SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                        .setPriceData(
                                SessionCreateParams.LineItem.PriceData.builder()
                                        .setCurrency(item.getCurrency())
                                        .setUnitAmount(discountedUnitPrice)
                                        .setProductData(productBuilder1.build())
                                        .build()
                        )
                        .setQuantity(item.getQuantity().longValue())
                        .build();
                paramsBuilder.addLineItem(lineItem);
            }
        } else {
            // No discount - add items with original prices
            for (CreateCheckoutSessionRequest.CheckoutItem item : request.getItems()) {
                SessionCreateParams.LineItem.PriceData.ProductData.Builder productBuilder2 =
                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                .setName(item.getName())
                                .putMetadata("product_id", item.getProductId());
                if (item.getImageUrl() != null && !item.getImageUrl().isBlank()) {
                    productBuilder2.addImage(item.getImageUrl());
                }
                SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                        .setPriceData(
                                SessionCreateParams.LineItem.PriceData.builder()
                                        .setCurrency(item.getCurrency())
                                        .setUnitAmount(item.getAmount())
                                        .setProductData(productBuilder2.build())
                                        .build()
                        )
                        .setQuantity(item.getQuantity().longValue())
                        .build();
                paramsBuilder.addLineItem(lineItem);
            }
        }

        Session session = Session.create(paramsBuilder.build());

        log.info("Checkout Session created: {}", session.getId());

        return StripeResponse.builder()
                .id(session.getId())
                .url(session.getUrl())
                .status(session.getStatus())
                .amount(session.getAmountTotal())
                .currency(session.getCurrency())
                .message("Checkout session created successfully")
                .build();
    }

    /**
     * Create a Payment Intent for direct payment with discount support
     */
    public StripeResponse createPaymentIntent(CreatePaymentIntentRequest request) throws StripeException {
        log.info("Creating Payment Intent for amount: {} {}", request.getAmount(), request.getCurrency());

        Map<String, Object> params = new HashMap<>();
        params.put("amount", request.getAmount());
        params.put("currency", request.getCurrency());
        params.put("automatic_payment_methods", Map.of("enabled", true));

        if (request.getDescription() != null) {
            params.put("description", request.getDescription());
        }

        // Add metadata
        Map<String, String> metadata = new HashMap<>();
        if (request.getOrderId() != null) {
            metadata.put("order_id", request.getOrderId());
        }
        if (request.getCustomerEmail() != null) {
            metadata.put("customer_email", request.getCustomerEmail());
        }
        if (request.getDiscountCode() != null) {
            metadata.put("discount_code", request.getDiscountCode());
        }
        if (!metadata.isEmpty()) {
            params.put("metadata", metadata);
        }

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        log.info("Payment Intent created: {}", paymentIntent.getId());

        return StripeResponse.builder()
                .id(paymentIntent.getId())
                .clientSecret(paymentIntent.getClientSecret())
                .status(paymentIntent.getStatus())
                .amount(paymentIntent.getAmount())
                .currency(paymentIntent.getCurrency())
                .message("Payment intent created successfully")
                .build();
    }

    /**
     * Retrieve Payment Intent status
     */
    public StripeResponse getPaymentIntent(String paymentIntentId) throws StripeException {
        log.info("Retrieving Payment Intent: {}", paymentIntentId);

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

        return StripeResponse.builder()
                .id(paymentIntent.getId())
                .status(paymentIntent.getStatus())
                .amount(paymentIntent.getAmount())
                .currency(paymentIntent.getCurrency())
                .message("Payment intent retrieved successfully")
                .build();
    }

    /**
     * Create a refund
     */
    public StripeResponse createRefund(RefundRequest request) throws StripeException {
        log.info("Creating refund for Payment Intent: {}", request.getPaymentIntentId());

        RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                .setPaymentIntent(request.getPaymentIntentId());

        if (request.getAmount() != null) {
            paramsBuilder.setAmount(request.getAmount());
        }

        if (request.getReason() != null) {
            RefundCreateParams.Reason reason = switch (request.getReason().toLowerCase()) {
                case "duplicate" -> RefundCreateParams.Reason.DUPLICATE;
                case "fraudulent" -> RefundCreateParams.Reason.FRAUDULENT;
                default -> RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER;
            };
            paramsBuilder.setReason(reason);
        }

        Refund refund = Refund.create(paramsBuilder.build());

        log.info("Refund created: {}", refund.getId());

        return StripeResponse.builder()
                .id(refund.getId())
                .status(refund.getStatus())
                .amount(refund.getAmount())
                .currency(refund.getCurrency())
                .message("Refund created successfully")
                .build();
    }

    /**
     * Handle Stripe webhook events
     */
    public String handleWebhook(String payload, String sigHeader) throws StripeException {
        log.info("Processing Stripe webhook");

        Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

        log.info("Webhook event type: {}", event.getType());

        // Handle different event types
        switch (event.getType()) {
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded(event);
                break;
            case "payment_intent.payment_failed":
                handlePaymentIntentFailed(event);
                break;
            case "checkout.session.completed":
                handleCheckoutSessionCompleted(event);
                break;
            case "charge.refunded":
                handleChargeRefunded(event);
                break;
            default:
                log.info("Unhandled event type: {}", event.getType());
        }

        return "Webhook processed successfully";
    }

    private void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        if (paymentIntent != null) {
            log.info("Payment succeeded for Payment Intent: {}", paymentIntent.getId());
            
            // Increment discount code usage if present
            String discountCode = paymentIntent.getMetadata().get("discount_code");
            if (discountCode != null && !discountCode.isBlank()) {
                discountService.incrementUsageCount(discountCode);
            }
            
            // TODO: Update order status in database
            String orderId = paymentIntent.getMetadata().get("order_id");
            if (orderId != null) {
                log.info("Updating order {} to PAID status", orderId);
                // orderService.updateOrderStatus(orderId, "PAID");
            }
        }
    }

    private void handlePaymentIntentFailed(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        if (paymentIntent != null) {
            log.error("Payment failed for Payment Intent: {}", paymentIntent.getId());
            // TODO: Update order status in database
            String orderId = paymentIntent.getMetadata().get("order_id");
            if (orderId != null) {
                log.info("Updating order {} to FAILED status", orderId);
                // orderService.updateOrderStatus(orderId, "FAILED");
            }
        }
    }

    private void handleCheckoutSessionCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        if (session != null) {
            log.info("Checkout session completed: {}", session.getId());
            
            // Increment discount code usage if present
            String discountCode = session.getMetadata().get("discount_code");
            if (discountCode != null && !discountCode.isBlank()) {
                discountService.incrementUsageCount(discountCode);
            }
            
            // TODO: Fulfill the order
            log.info("Customer email: {}", session.getCustomerEmail());
            log.info("Payment status: {}", session.getPaymentStatus());
        }
    }

    private void handleChargeRefunded(Event event) {
        Charge charge = (Charge) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        if (charge != null) {
            log.info("Charge refunded: {}", charge.getId());
            // TODO: Update order status in database
        }
    }

    /**
     * List all payment intents for a customer
     */
    public Map<String, Object> listPaymentIntents(String customerEmail, int limit) throws StripeException {
        log.info("Listing payment intents for customer: {}", customerEmail);

        PaymentIntentListParams params = PaymentIntentListParams.builder()
                .setLimit((long) limit)
                .build();

        PaymentIntentCollection paymentIntents = PaymentIntent.list(params);

        return Map.of(
                "data", paymentIntents.getData().stream()
                        .map(pi -> Map.of(
                                "id", pi.getId(),
                                "amount", pi.getAmount(),
                                "currency", pi.getCurrency(),
                                "status", pi.getStatus(),
                                "created", pi.getCreated()
                        ))
                        .collect(Collectors.toList()),
                "hasMore", paymentIntents.getHasMore()
        );
    }
}
