package com.example.backend.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

class UserAddressTest {

    @Test
    void testUserAddressCreation() {
        User user = User.builder()
                .email("test@example.com")
                .name("Test User")
                .build();

        UserAddress address = UserAddress.builder()
                .user(user)
                .addressTitle("Ev")
                .fullAddress("Test Caddesi No:1/1, Test Mahallesi, İstanbul")
                .city("İstanbul")
                .zipCode("34000")
                .isDefault(true)
                .build();

        assertNotNull(address);
        assertEquals("Ev", address.getAddressTitle());
        assertEquals("İstanbul", address.getCity());
        assertTrue(address.getIsDefault());
        assertEquals(user, address.getUser());
    }

    @Test
    void testPrePersistSetsId() {
        UserAddress address = new UserAddress();
        address.onCreate();
        
        assertNotNull(address.getId());
        assertFalse(address.getIsDefault()); // Should default to false
    }
}