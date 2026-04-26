package com.example.backend.controller;

import com.example.backend.dto.ReviewResponse;
import com.example.backend.service.ReviewService;
import com.example.backend.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByProduct(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<ReviewResponse> addReview(
            @PathVariable String productId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        int starRating = (int) body.getOrDefault("starRating", 5);
        String sentiment = InputSanitizer.sanitize((String) body.getOrDefault("sentiment", "POSITIVE"));
        return ResponseEntity.ok(reviewService.addReview(productId, userDetails.getUsername(), starRating, sentiment));
    }
}
