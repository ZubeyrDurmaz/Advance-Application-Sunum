package com.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.UserAddressRequest;
import com.example.backend.dto.UserAddressResponse;
import com.example.backend.entity.User;
import com.example.backend.entity.UserAddress;
import com.example.backend.repository.UserAddressRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserAddressService {

    private final UserAddressRepository userAddressRepository;
    private final UserRepository userRepository;

    public List<UserAddressResponse> getUserAddresses(String username) {
        User user = getUserByUsername(username);
        List<UserAddress> addresses = userAddressRepository.findByUserIdOrderByIsDefaultDescAddressTitleAsc(user.getId());
        return addresses.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public UserAddressResponse getAddressById(String username, String addressId) {
        User user = getUserByUsername(username);
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        // Kullanıcının kendi adresini kontrol et
        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Address does not belong to user");
        }
        
        return convertToResponse(address);
    }

    public UserAddressResponse createAddress(String username, UserAddressRequest request) {
        User user = getUserByUsername(username);
        
        // Eğer bu ilk adres ise veya isDefault true ise, diğer adresleri default olmaktan çıkar
        if (request.getIsDefault() || userAddressRepository.countByUser_Id(user.getId()) == 0) {
            userAddressRepository.resetDefaultAddressForUser(user.getId());
            request.setIsDefault(true);
        }
        
        UserAddress address = UserAddress.builder()
                .user(user)
                .addressTitle(request.getAddressTitle())
                .fullAddress(request.getFullAddress())
                .city(request.getCity())
                .zipCode(request.getZipCode())
                .isDefault(request.getIsDefault())
                .build();
        
        UserAddress savedAddress = userAddressRepository.save(address);
        return convertToResponse(savedAddress);
    }

    public UserAddressResponse updateAddress(String username, String addressId, UserAddressRequest request) {
        User user = getUserByUsername(username);
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        // Kullanıcının kendi adresini kontrol et
        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Address does not belong to user");
        }
        
        // Eğer isDefault true yapılıyorsa, diğer adresleri default olmaktan çıkar
        if (request.getIsDefault() && !address.getIsDefault()) {
            userAddressRepository.resetDefaultAddressForUser(user.getId());
        }
        
        address.setAddressTitle(request.getAddressTitle());
        address.setFullAddress(request.getFullAddress());
        address.setCity(request.getCity());
        address.setZipCode(request.getZipCode());
        address.setIsDefault(request.getIsDefault());
        
        UserAddress savedAddress = userAddressRepository.save(address);
        return convertToResponse(savedAddress);
    }

    public void deleteAddress(String username, String addressId) {
        User user = getUserByUsername(username);
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        // Kullanıcının kendi adresini kontrol et
        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Address does not belong to user");
        }
        
        boolean wasDefault = address.getIsDefault();
        userAddressRepository.delete(address);
        
        // Eğer silinen adres default ise, başka bir adresi default yap
        if (wasDefault) {
            List<UserAddress> remainingAddresses = userAddressRepository.findByUserId(user.getId());
            if (!remainingAddresses.isEmpty()) {
                UserAddress newDefault = remainingAddresses.get(0);
                newDefault.setIsDefault(true);
                userAddressRepository.save(newDefault);
            }
        }
    }

    public UserAddressResponse setDefaultAddress(String username, String addressId) {
        User user = getUserByUsername(username);
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        // Kullanıcının kendi adresini kontrol et
        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Address does not belong to user");
        }
        
        // Diğer adresleri default olmaktan çıkar
        userAddressRepository.resetDefaultAddressForUser(user.getId());
        
        // Bu adresi default yap
        address.setIsDefault(true);
        UserAddress savedAddress = userAddressRepository.save(address);
        
        return convertToResponse(savedAddress);
    }

    private User getUserByUsername(String username) {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserAddressResponse convertToResponse(UserAddress address) {
        return UserAddressResponse.builder()
                .id(address.getId())
                .addressTitle(address.getAddressTitle())
                .fullAddress(address.getFullAddress())
                .city(address.getCity())
                .zipCode(address.getZipCode())
                .isDefault(address.getIsDefault())
                .build();
    }
}