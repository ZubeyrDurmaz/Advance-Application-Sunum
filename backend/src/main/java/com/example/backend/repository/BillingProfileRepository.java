package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.BillingProfile;

@Repository
public interface BillingProfileRepository extends JpaRepository<BillingProfile, String> {

    /**
     * Find billing profile by user ID
     */
    Optional<BillingProfile> findByUserId(String userId);

    /**
     * Check if a billing profile exists for a user
     */
    boolean existsByUserId(String userId);

    /**
     * Find billing profile by user ID with address details
     */
    @Query("SELECT bp FROM BillingProfile bp LEFT JOIN FETCH bp.address WHERE bp.user.id = :userId")
    Optional<BillingProfile> findByUserIdWithAddress(@Param("userId") String userId);

    /**
     * Delete billing profile by user ID
     */
    void deleteByUserId(String userId);

    /**
     * Find billing profile by address ID
     */
    Optional<BillingProfile> findByAddressId(String addressId);

    /**
     * Check if an address is being used as billing address
     */
    boolean existsByAddressId(String addressId);
}