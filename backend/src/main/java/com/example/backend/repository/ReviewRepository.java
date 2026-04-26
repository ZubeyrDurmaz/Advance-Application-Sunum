package com.example.backend.repository;

import com.example.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByProduct_IdOrderByCreatedAtDesc(String productId);
    List<Review> findByUser_Id(String userId);
}
