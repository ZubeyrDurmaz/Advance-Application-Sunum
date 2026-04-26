package com.example.backend.repository;

import com.example.backend.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserId(String userId);
}
