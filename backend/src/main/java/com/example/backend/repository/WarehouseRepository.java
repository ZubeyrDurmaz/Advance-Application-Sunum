package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.Warehouse;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, String> {
    
    List<Warehouse> findByStatus(String status);
    
    List<Warehouse> findByCity(String city);
    
    List<Warehouse> findByType(String type);
}