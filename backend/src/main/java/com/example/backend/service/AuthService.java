package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.RefreshToken;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtUtil;
import com.example.backend.security.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final RefreshTokenService refreshTokenService;
    private final AuditLogService auditLogService;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails, user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        auditLogService.logAction("USER_LOGIN", "User logged in successfully", user.getEmail(), user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        Role role = Role.INDIVIDUAL;
        if (request.getRole() != null) {
            try { role = Role.valueOf(request.getRole().toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        String encoded = passwordEncoder.encode(request.getPassword());
        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .email(request.getEmail())
                .password(encoded)
                .passwordHash(encoded)
                .role(role)
                .roleType(role.name())
                .build();

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails, user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        auditLogService.logAction("USER_SIGNUP", "User registered successfully", user.getEmail(), user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse refreshToken(TokenRefreshRequest request) {
        RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        refreshTokenService.verifyExpiration(refreshToken);
        User user = refreshToken.getUser();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccessToken = jwtUtil.generateToken(userDetails, user.getRole().name());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public void logout(String userId) {
        refreshTokenService.deleteByUserId(userId);
    }
}
