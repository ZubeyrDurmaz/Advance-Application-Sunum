package com.example.backend.entity;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BillingProfileTest {

    private BillingProfile billingProfile;
    private User user;
    private UserAddress address;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id("user-123")
                .email("test@example.com")
                .name("Test User")
                .build();

        address = UserAddress.builder()
                .id("address-123")
                .user(user)
                .fullAddress("123 Main St")
                .city("Test City")
                .zipCode("12345")
                .build();

        billingProfile = new BillingProfile();
    }

    @Test
    void testBillingProfileCreation() {
        billingProfile.setUser(user);
        billingProfile.setAddress(address);
        billingProfile.setAccountHolderName("John Doe");

        assertEquals(user, billingProfile.getUser());
        assertEquals(address, billingProfile.getAddress());
        assertEquals("John Doe", billingProfile.getAccountHolderName());
    }

    @Test
    void testPrePersistSetsTimestampsAndId() {
        billingProfile.setUser(user);
        billingProfile.setAccountHolderName("John Doe");

        // Simulate @PrePersist
        billingProfile.onCreate();

        assertNotNull(billingProfile.getId());
        assertNotNull(billingProfile.getCreatedAt());
        assertNotNull(billingProfile.getUpdatedAt());
        assertEquals(billingProfile.getCreatedAt(), billingProfile.getUpdatedAt());
    }

    @Test
    void testPreUpdateSetsUpdatedAt() {
        billingProfile.setUser(user);
        billingProfile.setAccountHolderName("John Doe");
        billingProfile.onCreate();

        LocalDateTime originalCreatedAt = billingProfile.getCreatedAt();
        LocalDateTime originalUpdatedAt = billingProfile.getUpdatedAt();

        // Wait a bit to ensure different timestamps
        try {
            Thread.sleep(1);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Simulate @PreUpdate
        billingProfile.onUpdate();

        assertEquals(originalCreatedAt, billingProfile.getCreatedAt());
        assertTrue(billingProfile.getUpdatedAt().isAfter(originalUpdatedAt));
    }

    @Test
    void testBuilderPattern() {
        BillingProfile profile = BillingProfile.builder()
                .user(user)
                .address(address)
                .accountHolderName("Jane Smith")
                .build();

        assertEquals(user, profile.getUser());
        assertEquals(address, profile.getAddress());
        assertEquals("Jane Smith", profile.getAccountHolderName());
    }

    @Test
    void testAccountHolderNameIndependence() {
        // Test that account holder name can be different from user name
        billingProfile.setUser(user);
        billingProfile.setAccountHolderName("Different Name");

        assertEquals("Test User", user.getName());
        assertEquals("Different Name", billingProfile.getAccountHolderName());
        assertNotEquals(user.getName(), billingProfile.getAccountHolderName());
    }

    @Test
    void testNullAddressAllowed() {
        // Test that billing profile can exist without an address (temporarily)
        billingProfile.setUser(user);
        billingProfile.setAccountHolderName("John Doe");
        billingProfile.setAddress(null);

        assertNull(billingProfile.getAddress());
        assertNotNull(billingProfile.getUser());
        assertNotNull(billingProfile.getAccountHolderName());
    }
}