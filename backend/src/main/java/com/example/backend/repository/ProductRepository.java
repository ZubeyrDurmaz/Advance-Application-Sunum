package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.backend.entity.Product;

public interface ProductRepository extends JpaRepository<Product, String> {
    Optional<Product> findBySku(String sku);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> searchByName(String query);

    List<Product> findByCategory_Id(String categoryId);
    
    List<Product> findByStore_Id(String storeId);
    
    long countByStore_Id(String storeId);
}
