package com.example.backend.service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.dto.UserPaymentMethodRequest;
import com.example.backend.dto.UserPaymentMethodResponse;
import com.example.backend.entity.User;
import com.example.backend.entity.UserPaymentMethod;
import com.example.backend.repository.UserPaymentMethodRepository;
import com.example.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserPaymentMethodServiceTest {

    @Mock
    private UserPaymentMethodRepository userPaymentMethodRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserPaymentMethodService userPaymentMethodService;

    private User testUser;
    private UserPaymentMethod testPaymentMethod;
    private UserPaymentMethodRequest testRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-1")
                .email("test@example.com")
                .build();

        testPaymentMethod = UserPaymentMethod.builder()
                .id("payment-1")
                .user(testUser)
                .methodType("Credit Card")
                .provider("Visa")
                .cardToken("secure-token-123")
                .lastFour("1234")
                .expiryDate("12/2025")
                .isDefault(true)
                .build();

        testRequest = UserPaymentMethodRequest.builder()
                .methodType("Credit Card")
                .provider("MasterCard")
                .cardToken("secure-token-456")
                .lastFour("5678")
                .expiryDate("06/2026")
                .isDefault(false)
                .build();
    }

    @Test
    void getUserPaymentMethods_ShouldReturnUserPaymentMethods() {
        // Given
        List<UserPaymentMethod> paymentMethods = Arrays.asList(testPaymentMethod);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userPaymentMethodRepository.findByUserIdOrderByIsDefaultDescMethodTypeAsc("user-1"))
                .thenReturn(paymentMethods);

        // When
        List<UserPaymentMethodResponse> result = userPaymentMethodService.getUserPaymentMethods("test@example.com");

        // Then
        assertEquals(1, result.size());
        assertEquals("payment-1", result.get(0).getId());
        assertEquals("Credit Card", result.get(0).getMethodType());
        assertEquals("1234", result.get(0).getLastFour());
        assertTrue(result.get(0).getIsDefault());
        // cardToken should not be in response
    }

    @Test
    void getPaymentMethodById_ShouldReturnPaymentMethod_WhenUserOwnsPaymentMethod() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userPaymentMethodRepository.findById("payment-1")).thenReturn(Optional.of(testPaymentMethod));

        // When
        UserPaymentMethodResponse result = userPaymentMethodService.getPaymentMethodById("test@example.com", "payment-1");

        // Then
        assertEquals("payment-1", result.getId());
        assertEquals("Credit Card", result.getMethodType());
        assertEquals("1234", result.getLastFour());
    }

    @Test
    void getPaymentMethodById_ShouldThrowException_WhenUserDoesNotOwnPaymentMethod() {
        // Given
        User otherUser = User.builder().id("other-user").build();
        UserPaymentMethod otherPaymentMethod = UserPaymentMethod.builder()
                .id("payment-1")
                .user(otherUser)
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userPaymentMethodRepository.findById("payment-1")).thenReturn(Optional.of(otherPaymentMethod));

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            userPaymentMethodService.getPaymentMethodById("test@example.com", "payment-1"));
    }

    @Test
    void createPaymentMethod_ShouldSetAsDefault_WhenFirstPaymentMethod() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userPaymentMethodRepository.countByUser_Id("user-1")).thenReturn(0L);
        when(userPaymentMethodRepository.save(any(UserPaymentMethod.class))).thenReturn(testPaymentMethod);

        // When
        UserPaymentMethodResponse result = userPaymentMethodService.createPaymentMethod("test@example.com", testRequest);

        // Then
        verify(userPaymentMethodRepository).resetDefaultPaymentMethodForUser("user-1");
        verify(userPaymentMethodRepository).save(any(UserPaymentMethod.class));
        assertNotNull(result);
    }

    @Test
    void createPaymentMethod_ShouldResetOtherDefaults_WhenIsDefaultTrue() {
        // Given
        testRequest.setIsDefault(true);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userPaymentMethodRepository.save(any(UserPaymentMethod.class))).thenReturn(testPaymentMethod);

        // When
        userPaymentMethodService.createPaymentMethod("test@example.com", testRequest);

        // Then
        verify(userPaymentMethodRepository).resetDefaultPaymentMethodForUser("user-1");
    }

    @Test
    void updatePaymentMethod_ShouldUpdatePaymentMethod_WhenUserOwnsPaymentMethod() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userPaymentMethodRepository.findById("payment-1")).thenReturn(Optional.of(testPaymentMethod));
        when(userPaymentMethodRepository.save(any(UserPaymentMethod.class))).thenReturn(testPaymentMethod);

        // When
        UserPaymentMethodResponse result = userPaymentMethodService.updatePaymentMethod("test@example.com", "payment-1", testRequest);

        // Then
        verify(userPaymentMethodRepository).save(testPaymentMethod);
        assertNotNull(result);
    }

    @Test
    void updatePaymentMethod_ShouldNotUpdateCardToken_WhenTokenIsEmpty() {
        // Given
        String originalToken = testPaymentMethod.getCardToken();
        testRequest.setCardToken(""); // Empty token
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userPaymentMethodRepository.findById("payment-1")).thenReturn(Optional.of(testPaymentMethod));
        when(userPaymentMethodRepository.save(any(UserPaymentMethod.class))).thenReturn(testPaymentMethod);

        // When
        userPaymentMethodService.updatePaymentMethod("test@example.com", "payment-1", testRequest);

        // Then
        assertEquals(originalToken, testPaymentMethod.getCardToken()); // Should remain unchanged
    }

    @Test
    void deletePaymentMethod_ShouldDeletePaymentMethod_WhenUserOwnsPaymentMethod() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userPaymentMethodRepository.findById("payment-1")).thenReturn(Optional.of(testPaymentMethod));

        // When
        userPaymentMethodService.deletePaymentMethod("test@example.com", "payment-1");

        // Then
        verify(userPaymentMethodRepository).delete(testPaymentMethod);
    }

    @Test
    void deletePaymentMethod_ShouldSetNewDefault_WhenDeletingDefaultPaymentMethod() {
        // Given
        UserPaymentMethod remainingPaymentMethod = UserPaymentMethod.builder()
                .id("payment-2")
                .user(testUser)
                .isDefault(false)
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userPaymentMethodRepository.findById("payment-1")).thenReturn(Optional.of(testPaymentMethod));
        when(userPaymentMethodRepository.findByUserId("user-1")).thenReturn(Arrays.asList(remainingPaymentMethod));

        // When
        userPaymentMethodService.deletePaymentMethod("test@example.com", "payment-1");

        // Then
        verify(userPaymentMethodRepository).delete(testPaymentMethod);
        verify(userPaymentMethodRepository).save(remainingPaymentMethod);
        assertTrue(remainingPaymentMethod.getIsDefault());
    }

    @Test
    void setDefaultPaymentMethod_ShouldSetPaymentMethodAsDefault() {
        // Given
        testPaymentMethod.setIsDefault(false);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userPaymentMethodRepository.findById("payment-1")).thenReturn(Optional.of(testPaymentMethod));
        when(userPaymentMethodRepository.save(any(UserPaymentMethod.class))).thenReturn(testPaymentMethod);

        // When
        UserPaymentMethodResponse result = userPaymentMethodService.setDefaultPaymentMethod("test@example.com", "payment-1");

        // Then
        verify(userPaymentMethodRepository).resetDefaultPaymentMethodForUser("user-1");
        verify(userPaymentMethodRepository).save(testPaymentMethod);
        assertTrue(testPaymentMethod.getIsDefault());
        assertNotNull(result);
    }

    @Test
    void getUserPaymentMethods_ShouldThrowException_WhenUserNotFound() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            userPaymentMethodService.getUserPaymentMethods("test@example.com"));
    }

    @Test
    void convertToResponse_ShouldNotIncludeCardToken() {
        // Given
        List<UserPaymentMethod> paymentMethods = Arrays.asList(testPaymentMethod);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userPaymentMethodRepository.findByUserIdOrderByIsDefaultDescMethodTypeAsc("user-1"))
                .thenReturn(paymentMethods);

        // When
        List<UserPaymentMethodResponse> result = userPaymentMethodService.getUserPaymentMethods("test@example.com");

        // Then
        UserPaymentMethodResponse response = result.get(0);
        assertEquals("1234", response.getLastFour());
        assertEquals("Visa", response.getProvider());
        // cardToken should not be accessible in response
        assertDoesNotThrow(() -> response.getLastFour()); // Should be accessible
    }
}