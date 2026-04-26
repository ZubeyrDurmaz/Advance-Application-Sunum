package com.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.UserPaymentMethodRequest;
import com.example.backend.dto.UserPaymentMethodResponse;
import com.example.backend.entity.User;
import com.example.backend.entity.UserPaymentMethod;
import com.example.backend.repository.UserPaymentMethodRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserPaymentMethodService {

    private final UserPaymentMethodRepository userPaymentMethodRepository;
    private final UserRepository userRepository;

    public List<UserPaymentMethodResponse> getUserPaymentMethods(String username) {
        User user = getUserByUsername(username);
        List<UserPaymentMethod> paymentMethods = userPaymentMethodRepository.findByUserIdOrderByIsDefaultDescMethodTypeAsc(user.getId());
        return paymentMethods.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public UserPaymentMethodResponse getPaymentMethodById(String username, String paymentMethodId) {
        User user = getUserByUsername(username);
        UserPaymentMethod paymentMethod = userPaymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));
        
        // Kullanıcının kendi ödeme yöntemini kontrol et
        if (!paymentMethod.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Payment method does not belong to user");
        }
        
        return convertToResponse(paymentMethod);
    }

    public UserPaymentMethodResponse createPaymentMethod(String username, UserPaymentMethodRequest request) {
        User user = getUserByUsername(username);
        
        // Eğer bu ilk ödeme yöntemi ise veya isDefault true ise, diğer ödeme yöntemlerini default olmaktan çıkar
        if (request.getIsDefault() || userPaymentMethodRepository.countByUser_Id(user.getId()) == 0) {
            userPaymentMethodRepository.resetDefaultPaymentMethodForUser(user.getId());
            request.setIsDefault(true);
        }
        
        UserPaymentMethod paymentMethod = UserPaymentMethod.builder()
                .user(user)
                .methodType(request.getMethodType())
                .provider(request.getProvider())
                .cardToken(request.getCardToken()) // Güvenli token
                .lastFour(request.getLastFour())
                .expiryDate(request.getExpiryDate())
                .isDefault(request.getIsDefault())
                .build();
        
        UserPaymentMethod savedPaymentMethod = userPaymentMethodRepository.save(paymentMethod);
        return convertToResponse(savedPaymentMethod);
    }

    public UserPaymentMethodResponse updatePaymentMethod(String username, String paymentMethodId, UserPaymentMethodRequest request) {
        User user = getUserByUsername(username);
        UserPaymentMethod paymentMethod = userPaymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));
        
        // Kullanıcının kendi ödeme yöntemini kontrol et
        if (!paymentMethod.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Payment method does not belong to user");
        }
        
        // Eğer isDefault true yapılıyorsa, diğer ödeme yöntemlerini default olmaktan çıkar
        if (request.getIsDefault() && !paymentMethod.getIsDefault()) {
            userPaymentMethodRepository.resetDefaultPaymentMethodForUser(user.getId());
        }
        
        paymentMethod.setMethodType(request.getMethodType());
        paymentMethod.setProvider(request.getProvider());
        
        // Card token sadece yeni bir token verilirse güncellenir
        if (request.getCardToken() != null && !request.getCardToken().isEmpty()) {
            paymentMethod.setCardToken(request.getCardToken());
        }
        
        paymentMethod.setLastFour(request.getLastFour());
        paymentMethod.setExpiryDate(request.getExpiryDate());
        paymentMethod.setIsDefault(request.getIsDefault());
        
        UserPaymentMethod savedPaymentMethod = userPaymentMethodRepository.save(paymentMethod);
        return convertToResponse(savedPaymentMethod);
    }

    public void deletePaymentMethod(String username, String paymentMethodId) {
        User user = getUserByUsername(username);
        UserPaymentMethod paymentMethod = userPaymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));
        
        // Kullanıcının kendi ödeme yöntemini kontrol et
        if (!paymentMethod.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Payment method does not belong to user");
        }
        
        boolean wasDefault = paymentMethod.getIsDefault();
        userPaymentMethodRepository.delete(paymentMethod);
        
        // Eğer silinen ödeme yöntemi default ise, başka bir ödeme yöntemini default yap
        if (wasDefault) {
            List<UserPaymentMethod> remainingPaymentMethods = userPaymentMethodRepository.findByUserId(user.getId());
            if (!remainingPaymentMethods.isEmpty()) {
                UserPaymentMethod newDefault = remainingPaymentMethods.get(0);
                newDefault.setIsDefault(true);
                userPaymentMethodRepository.save(newDefault);
            }
        }
    }

    public UserPaymentMethodResponse setDefaultPaymentMethod(String username, String paymentMethodId) {
        User user = getUserByUsername(username);
        UserPaymentMethod paymentMethod = userPaymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));
        
        // Kullanıcının kendi ödeme yöntemini kontrol et
        if (!paymentMethod.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Payment method does not belong to user");
        }
        
        // Diğer ödeme yöntemlerini default olmaktan çıkar
        userPaymentMethodRepository.resetDefaultPaymentMethodForUser(user.getId());
        
        // Bu ödeme yöntemini default yap
        paymentMethod.setIsDefault(true);
        UserPaymentMethod savedPaymentMethod = userPaymentMethodRepository.save(paymentMethod);
        
        return convertToResponse(savedPaymentMethod);
    }

    private User getUserByUsername(String username) {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserPaymentMethodResponse convertToResponse(UserPaymentMethod paymentMethod) {
        return UserPaymentMethodResponse.builder()
                .id(paymentMethod.getId())
                .methodType(paymentMethod.getMethodType())
                .provider(paymentMethod.getProvider())
                .lastFour(paymentMethod.getLastFour()) // Sadece son 4 hane
                .expiryDate(paymentMethod.getExpiryDate())
                .isDefault(paymentMethod.getIsDefault())
                .build();
        // cardToken asla response'da döndürülmez - güvenlik
    }
}