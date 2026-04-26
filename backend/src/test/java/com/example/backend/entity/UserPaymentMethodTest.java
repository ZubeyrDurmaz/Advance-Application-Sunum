package com.example.backend.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

class UserPaymentMethodTest {

    @Test
    void testUserPaymentMethodCreation() {
        User user = User.builder()
                .email("test@example.com")
                .name("Test User")
                .build();

        UserPaymentMethod paymentMethod = UserPaymentMethod.builder()
                .user(user)
                .methodType("Credit Card")
                .provider("Visa")
                .cardToken("token_abc123")
                .lastFour("1234")
                .expiryDate("12/2025")
                .isDefault(true)
                .build();

        assertNotNull(paymentMethod);
        assertEquals("Credit Card", paymentMethod.getMethodType());
        assertEquals("Visa", paymentMethod.getProvider());
        assertEquals("1234", paymentMethod.getLastFour());
        assertEquals("12/2025", paymentMethod.getExpiryDate());
        assertTrue(paymentMethod.getIsDefault());
        assertEquals(user, paymentMethod.getUser());
    }

    @Test
    void testPrePersistSetsId() {
        UserPaymentMethod paymentMethod = new UserPaymentMethod();
        paymentMethod.onCreate();
        
        assertNotNull(paymentMethod.getId());
        assertFalse(paymentMethod.getIsDefault()); // Should default to false
    }
}