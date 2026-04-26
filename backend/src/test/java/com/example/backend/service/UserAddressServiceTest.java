package com.example.backend.service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

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

import com.example.backend.dto.UserAddressRequest;
import com.example.backend.dto.UserAddressResponse;
import com.example.backend.entity.User;
import com.example.backend.entity.UserAddress;
import com.example.backend.repository.UserAddressRepository;
import com.example.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserAddressServiceTest {

    @Mock
    private UserAddressRepository userAddressRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserAddressService userAddressService;

    private User testUser;
    private UserAddress testAddress;
    private UserAddressRequest testRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-1")
                .email("test@example.com")
                .build();

        testAddress = UserAddress.builder()
                .id("address-1")
                .user(testUser)
                .addressTitle("Home")
                .fullAddress("123 Test Street")
                .city("Test City")
                .zipCode("12345")
                .isDefault(true)
                .build();

        testRequest = UserAddressRequest.builder()
                .addressTitle("Work")
                .fullAddress("456 Work Avenue")
                .city("Work City")
                .zipCode("67890")
                .isDefault(false)
                .build();
    }

    @Test
    void getUserAddresses_ShouldReturnUserAddresses() {
        // Given
        List<UserAddress> addresses = Arrays.asList(testAddress);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userAddressRepository.findByUserIdOrderByIsDefaultDescAddressTitleAsc("user-1"))
                .thenReturn(addresses);

        // When
        List<UserAddressResponse> result = userAddressService.getUserAddresses("test@example.com");

        // Then
        assertEquals(1, result.size());
        assertEquals("address-1", result.get(0).getId());
        assertEquals("Home", result.get(0).getAddressTitle());
        assertTrue(result.get(0).getIsDefault());
    }

    @Test
    void getAddressById_ShouldReturnAddress_WhenUserOwnsAddress() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userAddressRepository.findById("address-1")).thenReturn(Optional.of(testAddress));

        // When
        UserAddressResponse result = userAddressService.getAddressById("test@example.com", "address-1");

        // Then
        assertEquals("address-1", result.getId());
        assertEquals("Home", result.getAddressTitle());
    }

    @Test
    void getAddressById_ShouldThrowException_WhenUserDoesNotOwnAddress() {
        // Given
        User otherUser = User.builder().id("other-user").build();
        UserAddress otherAddress = UserAddress.builder()
                .id("address-1")
                .user(otherUser)
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userAddressRepository.findById("address-1")).thenReturn(Optional.of(otherAddress));

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            userAddressService.getAddressById("test@example.com", "address-1"));
    }

    @Test
    void createAddress_ShouldSetAsDefault_WhenFirstAddress() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userAddressRepository.countByUser_Id("user-1")).thenReturn(0L);
        when(userAddressRepository.save(any(UserAddress.class))).thenReturn(testAddress);

        // When
        UserAddressResponse result = userAddressService.createAddress("test@example.com", testRequest);

        // Then
        verify(userAddressRepository).resetDefaultAddressForUser("user-1");
        verify(userAddressRepository).save(any(UserAddress.class));
        assertNotNull(result);
    }

    @Test
    void createAddress_ShouldResetOtherDefaults_WhenIsDefaultTrue() {
        // Given
        testRequest.setIsDefault(true);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userAddressRepository.save(any(UserAddress.class))).thenReturn(testAddress);

        // When
        userAddressService.createAddress("test@example.com", testRequest);

        // Then
        verify(userAddressRepository).resetDefaultAddressForUser("user-1");
    }

    @Test
    void updateAddress_ShouldUpdateAddress_WhenUserOwnsAddress() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userAddressRepository.findById("address-1")).thenReturn(Optional.of(testAddress));
        when(userAddressRepository.save(any(UserAddress.class))).thenReturn(testAddress);

        // When
        UserAddressResponse result = userAddressService.updateAddress("test@example.com", "address-1", testRequest);

        // Then
        verify(userAddressRepository).save(testAddress);
        assertNotNull(result);
    }

    @Test
    void deleteAddress_ShouldDeleteAddress_WhenUserOwnsAddress() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userAddressRepository.findById("address-1")).thenReturn(Optional.of(testAddress));

        // When
        userAddressService.deleteAddress("test@example.com", "address-1");

        // Then
        verify(userAddressRepository).delete(testAddress);
    }

    @Test
    void deleteAddress_ShouldSetNewDefault_WhenDeletingDefaultAddress() {
        // Given
        UserAddress remainingAddress = UserAddress.builder()
                .id("address-2")
                .user(testUser)
                .isDefault(false)
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userAddressRepository.findById("address-1")).thenReturn(Optional.of(testAddress));
        when(userAddressRepository.findByUserId("user-1")).thenReturn(Arrays.asList(remainingAddress));

        // When
        userAddressService.deleteAddress("test@example.com", "address-1");

        // Then
        verify(userAddressRepository).delete(testAddress);
        verify(userAddressRepository).save(remainingAddress);
        assertTrue(remainingAddress.getIsDefault());
    }

    @Test
    void setDefaultAddress_ShouldSetAddressAsDefault() {
        // Given
        testAddress.setIsDefault(false);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userAddressRepository.findById("address-1")).thenReturn(Optional.of(testAddress));
        when(userAddressRepository.save(any(UserAddress.class))).thenReturn(testAddress);

        // When
        UserAddressResponse result = userAddressService.setDefaultAddress("test@example.com", "address-1");

        // Then
        verify(userAddressRepository).resetDefaultAddressForUser("user-1");
        verify(userAddressRepository).save(testAddress);
        assertTrue(testAddress.getIsDefault());
        assertNotNull(result);
    }

    @Test
    void getUserAddresses_ShouldThrowException_WhenUserNotFound() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            userAddressService.getUserAddresses("test@example.com"));
    }
}