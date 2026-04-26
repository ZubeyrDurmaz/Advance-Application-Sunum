package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data @Builder @AllArgsConstructor
public class ReviewResponse {
    private String id;
    private String userName;
    private String productName;
    private Integer starRating;
    private String sentiment;
    private String createdAt;
}
