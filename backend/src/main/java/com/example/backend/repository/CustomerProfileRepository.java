package com.example.backend.repository;

import com.example.backend.entity.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, String> {
    Optional<CustomerProfile> findByUser_Id(String userId);
}
