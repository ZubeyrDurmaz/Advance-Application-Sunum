package com.example.backend.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.Order;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUser_IdOrderByOrderDateDesc(String userId);
    List<Order> findByStore_Id(String storeId);
    
    List<Order> findByStore_IdOrderByOrderDateDesc(String storeId);
    
    long countByStore_Id(String storeId);
    
    long countByUser_Id(String userId);
    
    @Query("SELECT SUM(o.grandTotal) FROM Order o WHERE o.store.id = :storeId")
    BigDecimal sumGrandTotalByStoreId(@Param("storeId") String storeId);
    
    @Query("SELECT SUM(o.grandTotal) FROM Order o WHERE o.user.id = :userId")
    BigDecimal sumGrandTotalByUserId(@Param("userId") String userId);
    
    @Query("SELECT DISTINCT o.user.id FROM Order o WHERE o.store.id = :storeId")
    List<String> findDistinctUserIdsByStoreId(@Param("storeId") String storeId);
    
    // Latest order date per user (for last-activity display)
    @Query("SELECT o.user.id, MAX(o.orderDate) FROM Order o GROUP BY o.user.id")
    List<Object[]> findLatestOrderDatePerUser();

    // Analytics queries
    @Query("SELECT c.name as categoryName, SUM(oi.price * oi.quantity) as totalSpent " +
           "FROM Order o " +
           "JOIN o.items oi " +
           "JOIN oi.product p " +
           "JOIN p.category c " +
           "WHERE o.user.id = :userId " +
           "GROUP BY c.id, c.name " +
           "ORDER BY totalSpent DESC")
    List<Object[]> findSpendingByCategory(@Param("userId") String userId);
    
    @Query("SELECT c.name as categoryName, SUM(oi.price * oi.quantity) as totalSpent " +
           "FROM Order o " +
           "JOIN o.items oi " +
           "JOIN oi.product p " +
           "JOIN p.category c " +
           "WHERE o.user.id = :userId " +
           "AND EXTRACT(YEAR FROM o.orderDate) = :year " +
           "GROUP BY c.id, c.name " +
           "ORDER BY totalSpent DESC")
    List<Object[]> findSpendingByCategoryByYear(@Param("userId") String userId, @Param("year") Integer year);
    
    @Query("SELECT EXTRACT(MONTH FROM o.orderDate) as month, " +
           "EXTRACT(YEAR FROM o.orderDate) as year, " +
           "COUNT(o) as orderCount " +
           "FROM Order o " +
           "WHERE o.user.id = :userId " +
           "AND EXTRACT(YEAR FROM o.orderDate) = :year " +
           "GROUP BY EXTRACT(YEAR FROM o.orderDate), EXTRACT(MONTH FROM o.orderDate) " +
           "ORDER BY EXTRACT(MONTH FROM o.orderDate)")
    List<Object[]> findMonthlyActivity(@Param("userId") String userId, @Param("year") Integer year);
    
    @Query("SELECT EXTRACT(MONTH FROM o.orderDate) as month, " +
           "0 as year, " +
           "COUNT(o) as orderCount " +
           "FROM Order o " +
           "WHERE o.user.id = :userId " +
           "GROUP BY EXTRACT(MONTH FROM o.orderDate) " +
           "ORDER BY EXTRACT(MONTH FROM o.orderDate)")
    List<Object[]> findAllTimeMonthlyActivity(@Param("userId") String userId);
}
