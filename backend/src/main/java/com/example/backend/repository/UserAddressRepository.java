package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.UserAddress;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, String> {

    List<UserAddress> findByUserId(String userId);

    Optional<UserAddress> findByUserIdAndIsDefault(String userId, Boolean isDefault);

    List<UserAddress> findByUserIdOrderByIsDefaultDescAddressTitleAsc(String userId);

    @Query("SELECT ua FROM UserAddress ua WHERE ua.user.id = :userId AND ua.city = :city")
    List<UserAddress> findByUserIdAndCity(@Param("userId") String userId, @Param("city") String city);

    @Modifying
    @Query("UPDATE UserAddress ua SET ua.isDefault = false WHERE ua.user.id = :userId")
    void resetDefaultAddressForUser(@Param("userId") String userId);

    @Query("SELECT COUNT(ua) FROM UserAddress ua WHERE ua.user.id = :userId")
    long countByUser_Id(@Param("userId") String userId);

    boolean existsByUser_IdAndIsDefaultTrue(String userId);
}