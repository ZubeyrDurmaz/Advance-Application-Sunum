package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.UserPaymentMethod;

@Repository
public interface UserPaymentMethodRepository extends JpaRepository<UserPaymentMethod, String> {

    List<UserPaymentMethod> findByUserId(String userId);

    Optional<UserPaymentMethod> findByUserIdAndIsDefault(String userId, Boolean isDefault);

    List<UserPaymentMethod> findByUserIdOrderByIsDefaultDescMethodTypeAsc(String userId);

    @Query("SELECT upm FROM UserPaymentMethod upm WHERE upm.user.id = :userId AND upm.methodType = :methodType")
    List<UserPaymentMethod> findByUserIdAndMethodType(@Param("userId") String userId, @Param("methodType") String methodType);

    @Query("SELECT upm FROM UserPaymentMethod upm WHERE upm.user.id = :userId AND upm.provider = :provider")
    List<UserPaymentMethod> findByUserIdAndProvider(@Param("userId") String userId, @Param("provider") String provider);

    @Modifying
    @Query("UPDATE UserPaymentMethod upm SET upm.isDefault = false WHERE upm.user.id = :userId")
    void resetDefaultPaymentMethodForUser(@Param("userId") String userId);

    @Query("SELECT COUNT(upm) FROM UserPaymentMethod upm WHERE upm.user.id = :userId")
    long countByUser_Id(@Param("userId") String userId);

    boolean existsByUser_IdAndIsDefaultTrue(String userId);

    @Query("SELECT upm FROM UserPaymentMethod upm WHERE upm.lastFour = :lastFour AND upm.user.id = :userId")
    Optional<UserPaymentMethod> findByUserIdAndLastFour(@Param("userId") String userId, @Param("lastFour") String lastFour);
}