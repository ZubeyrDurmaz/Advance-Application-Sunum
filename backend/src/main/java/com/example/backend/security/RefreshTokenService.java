package com.example.backend.security;

import com.example.backend.entity.RefreshToken;
import com.example.backend.entity.User;
import com.example.backend.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenDuration;

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDuration))
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token expired. Please login again.");
        }
        return token;
    }

    @Transactional
    public void deleteByUserId(String userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}
