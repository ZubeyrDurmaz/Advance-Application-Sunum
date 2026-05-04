package com.example.backend.service;

import com.example.backend.dto.AiQueryRequest;
import com.example.backend.dto.AiQueryResponse;
import com.example.backend.entity.Product;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;

    @Value("${anthropic.api.key:}")
    private String anthropicApiKey;

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-opus-4-7";

    private static final String SYSTEM_PROMPT = """
            You are Chronos AI, the intelligent assistant for Chronos — a luxury watch e-commerce platform.

            ## Platform Context
            Chronos is a sophisticated marketplace for luxury timepieces, connecting discerning collectors
            with exceptional horological heritage. Your responses should be elegant, knowledgeable, and
            reflect the refined sensibility of a master horologist.

            ## Database Schema (ER Diagram)
            The platform uses the following PostgreSQL database structure:

            ### Core Entities:
            - USERS (id UUID PK, email VARCHAR UNIQUE, password_hash VARCHAR, role ENUM[INDIVIDUAL,CORPORATE,ADMIN], created_at TIMESTAMP)
            - STORES (id UUID PK, owner_id UUID FK→USERS, name VARCHAR, status ENUM[PENDING,APPROVED,REJECTED], created_at TIMESTAMP)
            - CATEGORIES (id UUID PK, name VARCHAR, parent_id UUID FK→CATEGORIES [self-referential hierarchy])
            - PRODUCTS (id UUID PK, store_id UUID FK→STORES, category_id UUID FK→CATEGORIES, sku VARCHAR UNIQUE, name VARCHAR, unit_price DECIMAL, stock_quantity INT, created_at TIMESTAMP)

            ### Transactional:
            - ORDERS (id UUID PK, user_id UUID FK→USERS, store_id UUID FK→STORES, status ENUM[PENDING,CONFIRMED,SHIPPED,DELIVERED,CANCELLED], grand_total DECIMAL, order_date TIMESTAMP, discount_code_id UUID FK→DISCOUNT_CODES)
            - ORDER_ITEMS (id UUID PK, order_id UUID FK→ORDERS, product_id UUID FK→PRODUCTS, quantity INT, price DECIMAL)

            ### User-Related:
            - USER_ADDRESSES (id UUID PK, user_id UUID FK→USERS, city VARCHAR, full_address TEXT, is_default BOOLEAN)
            - USER_PAYMENT_METHODS (id UUID PK, user_id UUID FK→USERS, card_token VARCHAR, is_default BOOLEAN)
            - BILLING_PROFILES (id UUID PK, user_id UUID FK→USERS, company_name VARCHAR, tax_number VARCHAR, billing_address TEXT)
            - CUSTOMER_PROFILES (id UUID PK, user_id UUID FK→USERS, preference_tier VARCHAR, total_spent DECIMAL, loyalty_points INT)

            ### Reviews & Discounts:
            - REVIEWS (id UUID PK, user_id UUID FK→USERS, product_id UUID FK→PRODUCTS, star_rating INT[1-5], sentiment ENUM[POSITIVE,NEUTRAL,NEGATIVE], comment TEXT, created_at TIMESTAMP)
            - DISCOUNT_CODES (id UUID PK, store_id UUID FK→STORES, code VARCHAR UNIQUE, discount_value DECIMAL, discount_type ENUM[PERCENTAGE,FIXED], max_uses INT, used_count INT, is_active BOOLEAN, expiry_date TIMESTAMP)

            ### Logistics:
            - WAREHOUSES (id UUID PK, name VARCHAR, location VARCHAR, capacity INT)
            - DISTRIBUTORS (id UUID PK, name VARCHAR, country VARCHAR, contact_email VARCHAR)
            - SHIPMENTS (id UUID PK, order_id UUID FK→ORDERS, distributor_id UUID FK→DISTRIBUTORS, tracking_number VARCHAR, status VARCHAR, shipped_at TIMESTAMP, delivered_at TIMESTAMP)
            - RETURNS (id UUID PK, order_id UUID FK→ORDERS, reason TEXT, status ENUM[PENDING,APPROVED,REJECTED,COMPLETED], requested_at TIMESTAMP)
            - PRODUCT_LOCATIONS (product_id UUID FK→PRODUCTS, warehouse_id UUID FK→WAREHOUSES, quantity_stored INT)

            ### Security:
            - REFRESH_TOKENS (id UUID PK, user_id UUID FK→USERS, token VARCHAR UNIQUE, expiry_date TIMESTAMP)
            - AUDIT_LOGS (id UUID PK, user_id UUID, action VARCHAR, entity_type VARCHAR, entity_id VARCHAR, timestamp TIMESTAMP)

            ## Key Relationships:
            - Users with role INDIVIDUAL are customers; CORPORATE are store owners; ADMIN manage the platform
            - Each STORE belongs to exactly one CORPORATE user
            - PRODUCTS belong to a STORE and optionally to a CATEGORY
            - ORDERS reference both a USER (buyer) and a STORE (seller)
            - REVIEWS link a USER to a PRODUCT with a star rating and sentiment
            - CATEGORIES form a hierarchy via self-referential parent_id
            - ORDER_ITEMS are the line items within each ORDER

            ## Response Format:
            Always respond with a valid JSON object in this exact structure:
            {
              "text": "Your elegant, knowledgeable main response here",
              "followUp": "Optional follow-up context or invitation (use null if not needed)"
            }

            Rules:
            - "text": Required. Concise, sophisticated, written with the elegance of a luxury establishment.
            - "followUp": Optional. Use null if nothing meaningful to add.
            - Do NOT include a "recommendations" field — product data is injected by the backend separately.
            - Reference the database schema and relationships when relevant to the query.
            - If asked about specific SQL queries, explain what joins/tables would be involved.
            - Keep responses to 2-4 sentences maximum.
            """;

    public AiQueryResponse processQuery(AiQueryRequest request) {
        try {
            if (anthropicApiKey != null && !anthropicApiKey.isBlank()) {
                return callClaudeApi(request);
            }
            return fallbackResponse(request.message());
        } catch (Exception e) {
            return new AiQueryResponse(
                "Our curatorial intelligence is momentarily consulting the vault. Please try again shortly.",
                null,
                null
            );
        }
    }

    private AiQueryResponse callClaudeApi(AiQueryRequest request) {
        try {
            List<Map<String, String>> messages = new ArrayList<>();
            if (request.history() != null) {
                for (var msg : request.history()) {
                    messages.add(Map.of("role", msg.role(), "content", msg.content()));
                }
            }
            messages.add(Map.of("role", "user", "content", request.message()));

            Map<String, Object> body = Map.of(
                "model", MODEL,
                "max_tokens", 512,
                "system", SYSTEM_PROMPT,
                "messages", messages
            );

            RestClient client = RestClient.create();
            String rawResponse = client.post()
                .uri(ANTHROPIC_API_URL)
                .header("x-api-key", anthropicApiKey)
                .header("anthropic-version", "2023-06-01")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

            var root = objectMapper.readTree(rawResponse);
            String content = root.at("/content/0/text").asText();

            int jsonStart = content.indexOf('{');
            int jsonEnd = content.lastIndexOf('}');
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                content = content.substring(jsonStart, jsonEnd + 1);
            }

            var parsed = objectMapper.readTree(content);
            String text = parsed.path("text").asText("I am here to assist you with your horological inquiry.");
            String followUp = parsed.path("followUp").isNull() ? null : parsed.path("followUp").asText(null);

            List<AiQueryResponse.ProductRecommendation> recommendations = resolveRecommendations(request.message());

            return new AiQueryResponse(text, recommendations.isEmpty() ? null : recommendations, followUp);
        } catch (Exception e) {
            return fallbackResponse(request.message());
        }
    }

    private AiQueryResponse fallbackResponse(String message) {
        String lower = message.toLowerCase();

        // Try name-based product search first
        String searchTerm = extractMeaningfulWords(lower);
        if (!searchTerm.isBlank()) {
            List<Product> found = productRepository.searchByName(searchTerm);
            if (!found.isEmpty()) {
                var recs = toRecommendations(found.stream().limit(3).toList());
                return new AiQueryResponse(
                    "I have located " + found.size() + " timepiece(s) matching your inquiry. Each has been selected from our curated vault.",
                    recs,
                    "Should you wish to explore further details, simply ask."
                );
            }
        }

        // Intent: browse all products or collection
        if (containsAny(lower, "product", "watch", "collection", "show", "list", "all", "ürün", "saat", "koleksiyon", "göster", "listele", "tümü", "hepsi")) {
            List<Product> products = productRepository.findAll().stream().limit(5).toList();
            if (products.isEmpty()) {
                return new AiQueryResponse(
                    "Our vault currently awaits its treasures. No timepieces have been listed at this time.",
                    null,
                    "Please check back shortly for new arrivals from our partner stores."
                );
            }
            return new AiQueryResponse(
                "Allow me to present our current curated selection — " + products.size() + " exceptional timepieces, each chosen for its horological merit.",
                toRecommendations(products),
                "I can narrow the selection by category, price range, or availability upon request."
            );
        }

        // Intent: stock / availability
        if (containsAny(lower, "stock", "available", "availability", "stok", "mevcut", "var mı", "varmı", "in stock")) {
            List<Product> inStock = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() > 0)
                .limit(3).toList();
            String text = inStock.isEmpty()
                ? "Our acquisition team is currently replenishing the vault. No pieces are available for immediate acquisition at this moment."
                : "We currently have " + inStock.size() + " piece(s) available for immediate acquisition.";
            return new AiQueryResponse(
                text,
                inStock.isEmpty() ? null : toRecommendations(inStock),
                "I recommend expressing interest promptly — our finest pieces are acquired swiftly."
            );
        }

        // Intent: categories
        if (containsAny(lower, "category", "categories", "type", "kind", "kategori", "tip", "tür")) {
            var categories = categoryRepository.findAll();
            String catList = categories.stream().map(c -> c.getName()).collect(Collectors.joining(", "));
            String text = catList.isBlank()
                ? "Our collection spans the full spectrum of haute horlogerie."
                : "The Chronos collection is organized across the following categories: " + catList + ".";
            return new AiQueryResponse(text, null, "Which category speaks to your horological sensibility?");
        }

        // Intent: price / budget
        if (containsAny(lower, "price", "cost", "expensive", "cheap", "budget", "afford", "fiyat", "maliyet", "pahalı", "ucuz", "bütçe")) {
            List<Product> affordable = productRepository.findAll().stream()
                .filter(p -> p.getUnitPrice() != null)
                .sorted(Comparator.comparing(Product::getUnitPrice))
                .limit(3).toList();
            return new AiQueryResponse(
                "At Chronos, we believe that true value transcends price. Here are our most accessible treasures, each representing exceptional craftsmanship at its respective tier.",
                affordable.isEmpty() ? null : toRecommendations(affordable),
                "Every timepiece at Chronos carries a story worth its investment."
            );
        }

        // Intent: order / shipment
        if (containsAny(lower, "order", "shipment", "shipping", "delivery", "sipariş", "kargo", "teslimat", "gönderim")) {
            return new AiQueryResponse(
                "Orders at Chronos flow through a meticulous process: PENDING → CONFIRMED → SHIPPED → DELIVERED, with each transition tracked via our ORDERS and SHIPMENTS tables.",
                null,
                "To review your specific orders, please navigate to your account dashboard."
            );
        }

        // Intent: review / rating
        if (containsAny(lower, "review", "rating", "star", "comment", "yorum", "puan", "değerlendirme")) {
            return new AiQueryResponse(
                "Our review system captures both a numerical star rating (1–5) and a sentiment classification (POSITIVE, NEUTRAL, or NEGATIVE), stored in the REVIEWS table linked to both USER and PRODUCT.",
                null,
                "Authentic reviews from verified purchasers guide our curatorial process."
            );
        }

        // Default response
        return new AiQueryResponse(
            "A fascinating inquiry. Our curatorial expertise spans the full breadth of horology — from the precision of grand complications to the artistry of guilloché dials.",
            null,
            "Could you share more about your preferences? Perhaps a particular era, complication, price range, or occasion?"
        );
    }

    private List<AiQueryResponse.ProductRecommendation> resolveRecommendations(String message) {
        String searchTerm = extractMeaningfulWords(message.toLowerCase());
        if (searchTerm.isBlank()) return List.of();
        List<Product> found = productRepository.searchByName(searchTerm);
        return toRecommendations(found.stream().limit(3).toList());
    }

    private List<AiQueryResponse.ProductRecommendation> toRecommendations(List<Product> products) {
        return products.stream().map(p -> new AiQueryResponse.ProductRecommendation(
            p.getName(),
            p.getSku(),
            "$" + p.getUnitPrice().toPlainString(),
            null
        )).collect(Collectors.toList());
    }

    private boolean containsAny(String text, String... keywords) {
        return Arrays.stream(keywords).anyMatch(text::contains);
    }

    private String extractMeaningfulWords(String lower) {
        Set<String> stopWords = Set.of(
            "me", "about", "the", "tell", "show", "find", "search", "for", "a", "an", "is", "are",
            "what", "which", "do", "you", "have", "i", "want", "need", "looking", "can", "please",
            "any", "some", "get", "give", "that", "this", "with", "from", "on", "at", "to", "in",
            "bana", "göster", "hakkında", "ara", "bul", "var", "mi", "mı", "ne", "nedir", "nasıl",
            "bir", "de", "da", "için", "ile", "ve", "bu", "şu", "lütfen", "istiyorum", "lazım"
        );
        return Arrays.stream(lower.split("\\s+"))
            .filter(w -> !stopWords.contains(w) && w.length() > 2)
            .collect(Collectors.joining(" "));
    }
}
