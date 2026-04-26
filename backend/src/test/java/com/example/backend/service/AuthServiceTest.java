package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.SignupRequest;
import com.example.backend.entity.RefreshToken;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtUtil;
import com.example.backend.security.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RefreshToken testRefreshToken;
    private UserDetails mockUserDetails;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-1")
                .email("test@test.com")
                .name("Test User")
                .password("encoded_pass")
                .role(Role.INDIVIDUAL)
                .build();
                
        testRefreshToken = new RefreshToken();
        testRefreshToken.setToken("refresh_token_123");
        testRefreshToken.setUser(testUser);
        
        mockUserDetails = mock(UserDetails.class);
    }

    @Test
    void login_Successful() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@test.com");
        req.setPassword("password");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(userDetailsService.loadUserByUsername("test@test.com")).thenReturn(mockUserDetails);
        when(jwtUtil.generateToken(mockUserDetails, "INDIVIDUAL")).thenReturn("access_token_123");
        when(refreshTokenService.createRefreshToken(testUser)).thenReturn(testRefreshToken);

        AuthResponse response = authService.login(req);

        assertNotNull(response);
        assertEquals("access_token_123", response.getAccessToken());
        assertEquals("refresh_token_123", response.getRefreshToken());
        assertEquals("Test User", response.getName());
        assertEquals("INDIVIDUAL", response.getRole());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(auditLogService).logAction("USER_LOGIN", "User logged in successfully", "test@test.com", "user-1");
    }

    @Test
    void signup_Successful() {
        SignupRequest req = new SignupRequest();
        req.setName("New User");
        req.setEmail("new@test.com");
        req.setPassword("pass");
        req.setRole("CORPORATE");

        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("encoded");
        when(userDetailsService.loadUserByUsername("new@test.com")).thenReturn(mockUserDetails);
        when(jwtUtil.generateToken(mockUserDetails, "CORPORATE")).thenReturn("access_token");
        
        RefreshToken rt = new RefreshToken();
        rt.setToken("refresh");
        when(refreshTokenService.createRefreshToken(any(User.class))).thenReturn(rt);

        AuthResponse response = authService.signup(req);

        assertNotNull(response);
        assertEquals("CORPORATE", response.getRole());
        verify(userRepository).save(any(User.class));
        verify(auditLogService).logAction(eq("USER_SIGNUP"), anyString(), eq("new@test.com"), anyString());
    }

    @Test
    void signup_EmailExists_ThrowsException() {
        SignupRequest req = new SignupRequest();
        req.setEmail("test@test.com");

        when(userRepository.existsByEmail("test@test.com")).thenReturn(true);

        Exception e = assertThrows(RuntimeException.class, () -> authService.signup(req));
        assertEquals("Email already in use", e.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}
