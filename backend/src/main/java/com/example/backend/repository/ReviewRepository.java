package com.example.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByProduct_IdOrderByCreatedAtDesc(String productId);
    Page<Review> findByProduct_Id(String productId, Pageable pageable);
    List<Review> findByUser_Id(String userId);
}
