package com.example.backend.service;

import com.example.backend.dto.ReviewResponse;
import com.example.backend.entity.Review;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<ReviewResponse> getReviewsByProductId(String productId) {
        return reviewRepository.findByProduct_IdOrderByCreatedAtDesc(productId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse addReview(String productId, String userEmail, int starRating, String sentiment) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = Review.builder()
                .id(UUID.randomUUID().toString())
                .product(product)
                .user(user)
                .starRating(starRating)
                .sentiment(sentiment)
                .build();

        return toResponse(reviewRepository.save(review));
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .userName(r.getUser() != null ? r.getUser().getName() : null)
                .productName(r.getProduct() != null ? r.getProduct().getName() : null)
                .starRating(r.getStarRating())
                .sentiment(r.getSentiment())
                .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                .build();
    }
}
