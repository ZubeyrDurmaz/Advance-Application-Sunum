package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.ProductLocation;

@Repository
public interface ProductLocationRepository extends JpaRepository<ProductLocation, String> {
    
    List<ProductLocation> findByProduct_Id(String productId);
    
    List<ProductLocation> findByWarehouse_Id(String warehouseId);
    
    List<ProductLocation> findByDistributor_Id(String distributorId);
    
    List<ProductLocation> findByStatus(String status);
    
    @Query("SELECT pl FROM ProductLocation pl WHERE pl.product.id = :productId AND pl.status = 'AVAILABLE'")
    List<ProductLocation> findAvailableLocationsByProduct(@Param("productId") String productId);
}