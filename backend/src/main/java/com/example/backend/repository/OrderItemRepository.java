package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.backend.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, String> {
    List<OrderItem> findByOrder_Id(String orderId);
    
    @Query("SELECT oi FROM OrderItem oi JOIN FETCH oi.order o JOIN FETCH o.user")
    List<OrderItem> findAllWithOrderAndUser();
}
