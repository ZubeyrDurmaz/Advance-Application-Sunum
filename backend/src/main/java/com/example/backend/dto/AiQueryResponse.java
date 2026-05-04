package com.example.backend.dto;

import java.util.List;

public record AiQueryResponse(
    String text,
    List<ProductRecommendation> recommendations,
    String followUp
) {
    public record ProductRecommendation(String name, String ref, String price, String image) {}
}
