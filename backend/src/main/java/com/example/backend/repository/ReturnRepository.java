package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.Return;

@Repository
public interface ReturnRepository extends JpaRepository<Return, String> {
    
    List<Return> findByUser_Id(String userId);
    
    List<Return> findByStatus(String status);
    
    List<Return> findByOrderItem_Id(String orderItemId);
    
    @Query("SELECT r FROM Return r WHERE r.user.id = :userId ORDER BY r.requestedAt DESC")
    List<Return> findByUserIdOrderByRequestedAtDesc(@Param("userId") String userId);
}