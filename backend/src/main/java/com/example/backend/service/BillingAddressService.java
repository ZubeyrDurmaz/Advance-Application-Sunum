package com.example.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.BillingProfileResponse;
import com.example.backend.dto.CreateBillingAddressRequest;
import com.example.backend.dto.SetBillingAddressRequest;
import com.example.backend.dto.UpdateBillingProfileRequest;
import com.example.backend.dto.UserAddressRequest;
import com.example.backend.dto.UserAddressResponse;
import com.example.backend.entity.BillingProfile;
import com.example.backend.entity.User;
import com.example.backend.entity.UserAddress;
import com.example.backend.repository.BillingProfileRepository;
import com.example.backend.repository.UserAddressRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BillingAddressService {

    private final BillingProfileRepository billingProfileRepository;
    private final UserAddressRepository userAddressRepository;
    private final UserRepository userRepository;
    private final UserAddressService userAddressService;

    /**
     * Get user's current billing profile
     */
    @Transactional(readOnly = true)
    public Optional<BillingProfileResponse> getBillingProfile(String username) {
        User user = getUserByUsername(username);
        Optional<BillingProfile> billingProfile = billingProfileRepository.findByUserIdWithAddress(user.getId());
        return billingProfile.map(this::convertToResponse);
    }

    /**
     * Set existing address as billing address
     */
    public BillingProfileResponse setBillingAddress(String username, SetBillingAddressRequest request) {
        User user = getUserByUsername(username);
        
        // Validate that the address exists and belongs to the user
        UserAddress address = userAddressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Address does not belong to user");
        }

        // Validate account holder name format
        validateAccountHolderName(request.getAccountHolderName());

        // Create or update billing profile (enforcing single active billing address)
        BillingProfile billingProfile = billingProfileRepository.findByUserId(user.getId())
                .orElse(BillingProfile.builder()
                        .user(user)
                        .build());

        billingProfile.setAddress(address);
        billingProfile.setAccountHolderName(request.getAccountHolderName());

        BillingProfile savedProfile = billingProfileRepository.save(billingProfile);
        return convertToResponse(savedProfile);
    }

    /**
     * Create new address and set as billing
     */
    public BillingProfileResponse createBillingAddress(String username, CreateBillingAddressRequest request) {
        User user = getUserByUsername(username);

        // Validate account holder name format
        validateAccountHolderName(request.getAccountHolderName());

        // Create new address using UserAddressService
        UserAddressRequest addressRequest = UserAddressRequest.builder()
                .addressTitle(request.getAddressTitle())
                .fullAddress(request.getFullAddress())
                .city(request.getCity())
                .zipCode(request.getZipCode())
                .isDefault(false) // Don't make it default address, just billing
                .build();

        UserAddressResponse addressResponse = userAddressService.createAddress(username, addressRequest);
        
        // Get the created address entity
        UserAddress address = userAddressRepository.findById(addressResponse.getId())
                .orElseThrow(() -> new RuntimeException("Failed to create address"));

        // Create or update billing profile
        BillingProfile billingProfile = billingProfileRepository.findByUserId(user.getId())
                .orElse(BillingProfile.builder()
                        .user(user)
                        .build());

        billingProfile.setAddress(address);
        billingProfile.setAccountHolderName(request.getAccountHolderName());

        BillingProfile savedProfile = billingProfileRepository.save(billingProfile);
        return convertToResponse(savedProfile);
    }

    /**
     * Update billing profile (address and account holder)
     */
    public BillingProfileResponse updateBillingProfile(String username, UpdateBillingProfileRequest request) {
        User user = getUserByUsername(username);
        
        BillingProfile billingProfile = billingProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Billing profile not found"));

        // Validate account holder name format
        validateAccountHolderName(request.getAccountHolderName());

        // Update account holder name
        billingProfile.setAccountHolderName(request.getAccountHolderName());

        // If addressId is provided, update the address reference
        if (request.getAddressId() != null) {
            UserAddress address = userAddressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new RuntimeException("Address not found"));
            
            if (!address.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Access denied: Address does not belong to user");
            }
            
            billingProfile.setAddress(address);
        }

        // If address fields are provided, update the current billing address
        if (billingProfile.getAddress() != null && hasAddressFields(request)) {
            UserAddress currentAddress = billingProfile.getAddress();
            
            UserAddressRequest addressUpdateRequest = UserAddressRequest.builder()
                    .addressTitle(request.getAddressTitle() != null ? request.getAddressTitle() : currentAddress.getAddressTitle())
                    .fullAddress(request.getFullAddress() != null ? request.getFullAddress() : currentAddress.getFullAddress())
                    .city(request.getCity() != null ? request.getCity() : currentAddress.getCity())
                    .zipCode(request.getZipCode() != null ? request.getZipCode() : currentAddress.getZipCode())
                    .isDefault(currentAddress.getIsDefault())
                    .build();

            userAddressService.updateAddress(username, currentAddress.getId(), addressUpdateRequest);
        }

        BillingProfile savedProfile = billingProfileRepository.save(billingProfile);
        return convertToResponse(savedProfile);
    }

    /**
     * Clear billing address
     */
    public void clearBillingAddress(String username) {
        User user = getUserByUsername(username);
        billingProfileRepository.deleteByUserId(user.getId());
    }

    /**
     * Get addresses available for billing selection
     */
    @Transactional(readOnly = true)
    public List<UserAddressResponse> getAvailableAddressesForBilling(String username) {
        return userAddressService.getUserAddresses(username);
    }

    /**
     * Check if an address is being used as billing address
     */
    @Transactional(readOnly = true)
    public boolean isAddressUsedForBilling(String addressId) {
        return billingProfileRepository.existsByAddressId(addressId);
    }

    /**
     * Handle address deletion - clear billing profile if the address was used for billing
     */
    public void handleAddressDeletion(String addressId) {
        Optional<BillingProfile> billingProfile = billingProfileRepository.findByAddressId(addressId);
        if (billingProfile.isPresent()) {
            BillingProfile profile = billingProfile.get();
            profile.setAddress(null); // Clear the address reference
            billingProfileRepository.save(profile);
        }
    }

    private User getUserByUsername(String username) {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void validateAccountHolderName(String accountHolderName) {
        if (accountHolderName == null || accountHolderName.trim().isEmpty()) {
            throw new RuntimeException("Account holder name is required");
        }
        
        if (accountHolderName.length() < 2 || accountHolderName.length() > 100) {
            throw new RuntimeException("Account holder name must be between 2 and 100 characters");
        }
        
        if (!accountHolderName.matches("^[a-zA-Z\\s\\-\\.,']+$")) {
            throw new RuntimeException("Account holder name can only contain letters, spaces, and common punctuation");
        }
        
        // Check for at least two words
        String[] words = accountHolderName.trim().split("\\s+");
        if (words.length < 2) {
            throw new RuntimeException("Account holder name must contain at least two words");
        }
    }

    private boolean hasAddressFields(UpdateBillingProfileRequest request) {
        return request.getAddressTitle() != null || 
               request.getFullAddress() != null || 
               request.getCity() != null || 
               request.getZipCode() != null;
    }

    private BillingProfileResponse convertToResponse(BillingProfile billingProfile) {
        UserAddressResponse addressResponse = null;
        if (billingProfile.getAddress() != null) {
            UserAddress address = billingProfile.getAddress();
            addressResponse = UserAddressResponse.builder()
                    .id(address.getId())
                    .addressTitle(address.getAddressTitle())
                    .fullAddress(address.getFullAddress())
                    .city(address.getCity())
                    .zipCode(address.getZipCode())
                    .isDefault(address.getIsDefault())
                    .build();
        }

        return BillingProfileResponse.builder()
                .id(billingProfile.getId())
                .accountHolderName(billingProfile.getAccountHolderName())
                .address(addressResponse)
                .createdAt(billingProfile.getCreatedAt())
                .updatedAt(billingProfile.getUpdatedAt())
                .build();
    }
}