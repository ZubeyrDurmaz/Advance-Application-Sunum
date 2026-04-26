package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.Distributor;

@Repository
public interface DistributorRepository extends JpaRepository<Distributor, String> {
    
    List<Distributor> findByStatus(String status);
    
    List<Distributor> findByCity(String city);
    
    Optional<Distributor> findByContactEmail(String contactEmail);
}