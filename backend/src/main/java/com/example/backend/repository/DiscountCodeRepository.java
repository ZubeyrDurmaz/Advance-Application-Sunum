package com.example.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.DiscountCode;

@Repository
public interface DiscountCodeRepository extends JpaRepository<DiscountCode, String> {
    
    Optional<DiscountCode> findByCode(String code);
    
    List<DiscountCode> findByStore_Id(String storeId);
    
    List<DiscountCode> findByStatus(String status);
    
    @Query("SELECT dc FROM DiscountCode dc WHERE dc.code = :code AND dc.status = 'ACTIVE' AND dc.validFrom <= :now AND dc.validUntil >= :now")
    Optional<DiscountCode> findValidDiscountCode(@Param("code") String code, @Param("now") LocalDateTime now);
}