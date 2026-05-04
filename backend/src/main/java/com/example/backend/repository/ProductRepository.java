package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.example.backend.entity.Product;

public interface ProductRepository extends JpaRepository<Product, String>, JpaSpecificationExecutor<Product> {

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.store")
    List<Product> findAllWithDetails();

    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.store " +
           "WHERE p.sku = :sku")
    Optional<Product> findBySkuWithDetails(String sku);

    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.store " +
           "WHERE p.id = :id")
    Optional<Product> findByIdWithDetails(String id);

    Optional<Product> findBySku(String sku);

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.store " +
           "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> searchByName(String query);

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.store " +
           "WHERE p.category.id = :categoryId")
    List<Product> findByCategory_Id(String categoryId);

    List<Product> findByStore_Id(String storeId);

    long countByStore_Id(String storeId);
}
