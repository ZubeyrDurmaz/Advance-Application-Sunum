package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {
    
    Optional<CartItem> findByCartIdAndProductId(String cartId, String productId);
    
    void deleteByCartId(String cartId);
}
