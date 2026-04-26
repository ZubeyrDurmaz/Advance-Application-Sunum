package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthController authController;

    private AuthResponse authResponse;
    private User user;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(MethodParameter parameter) {
                        return parameter.getParameterAnnotation(AuthenticationPrincipal.class) != null;
                    }
                    @Override
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                        return org.springframework.security.core.userdetails.User.builder()
                                .username("test@example.com")
                                .password("password")
                                .authorities("INDIVIDUAL")
                                .build();
                    }
                })
                .build();

        authResponse = AuthResponse.builder()
                .accessToken("mock-token")
                .refreshToken("mock-refresh-token")
                .name("Test User")
                .email("test@example.com")
                .role("INDIVIDUAL")
                .build();

        user = new User();
        user.setId("user-1");
        user.setEmail("test@example.com");
        user.setName("Test User");
        user.setRole(Role.INDIVIDUAL);
    }

    @Test
    void login_ShouldReturnAuthResponse() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");
        
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock-token"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void signup_ShouldReturnAuthResponse() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("password");

        when(authService.signup(any(SignupRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock-token"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void refreshToken_ShouldReturnAuthResponse() throws Exception {
        TokenRefreshRequest request = new TokenRefreshRequest();
        request.setRefreshToken("mock-refresh-token");

        when(authService.refreshToken(any(TokenRefreshRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock-token"));
    }

    @Test
    void logout_ShouldReturnSuccessMessage() throws Exception {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        doNothing().when(authService).logout("user-1");

        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));

        verify(authService).logout("user-1");
    }

    @Test
    void me_ShouldReturnUserDetails() throws Exception {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.role").value("INDIVIDUAL"));
    }
}
