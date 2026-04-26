package com.example.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.CategorySpendingResponse;
import com.example.backend.dto.ChangePasswordRequest;
import com.example.backend.dto.DashboardStatsResponse;
import com.example.backend.dto.MonthlyActivityResponse;
import com.example.backend.dto.UpdateProfileRequest;
import com.example.backend.dto.UserProfileResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.UserAddressRepository;
import com.example.backend.repository.UserPaymentMethodRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final UserAddressRepository userAddressRepository;
    private final UserPaymentMethodRepository userPaymentMethodRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getProfile(String email) {
        User user = findByEmail(email);
        return toProfileResponse(user);
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest req) {
        User user = findByEmail(email);
        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName());
        }
        if (req.getEmail() != null && !req.getEmail().isBlank() && !req.getEmail().equals(email)) {
            if (userRepository.existsByEmail(req.getEmail())) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(req.getEmail());
        }
        return toProfileResponse(userRepository.save(user));
    }

    public void changePassword(String email, ChangePasswordRequest req) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        String encoded = passwordEncoder.encode(req.getNewPassword());
        user.setPassword(encoded);
        user.setPasswordHash(encoded);
        userRepository.save(user);
    }

    public DashboardStatsResponse getDashboardStats(String email) {
        User user = findByEmail(email);
        long orderCount = orderRepository.countByUser_Id(user.getId());
        BigDecimal totalSpent = orderRepository.sumGrandTotalByUserId(user.getId());

        List<com.example.backend.entity.Order> orders =
                orderRepository.findByUser_IdOrderByOrderDateDesc(user.getId());

        String lastOrderDate = orders.isEmpty() ? null :
                orders.get(0).getOrderDate().toLocalDate().toString();

        // Get address and payment method counts
        long addressCount = userAddressRepository.countByUser_Id(user.getId());
        long paymentMethodCount = userPaymentMethodRepository.countByUser_Id(user.getId());
        
        // Check for default address and payment method
        boolean hasDefaultAddress = userAddressRepository.existsByUser_IdAndIsDefaultTrue(user.getId());
        boolean hasDefaultPaymentMethod = userPaymentMethodRepository.existsByUser_IdAndIsDefaultTrue(user.getId());

        return DashboardStatsResponse.builder()
                .orderCount(orderCount)
                .totalSpent(totalSpent != null ? totalSpent : BigDecimal.ZERO)
                .memberSince(user.getCreatedAt() != null ?
                        user.getCreatedAt().toLocalDate().toString() : null)
                .lastOrderDate(lastOrderDate)
                .membershipType("Elite Member")
                .addressCount(addressCount)
                .paymentMethodCount(paymentMethodCount)
                .cartItemCount(0) // Cart is frontend-only for now
                .hasDefaultAddress(hasDefaultAddress)
                .hasDefaultPaymentMethod(hasDefaultPaymentMethod)
                .build();
    }

    public List<CategorySpendingResponse> getSpendingByCategory(String email) {
        return getSpendingByCategory(email, null);
    }

    public List<CategorySpendingResponse> getSpendingByCategory(String email, Integer year) {
        User user = findByEmail(email);
        
        List<Object[]> results;
        if (year == null) {
            // All Time - get all years
            results = orderRepository.findSpendingByCategory(user.getId());
        } else {
            // Specific year
            results = orderRepository.findSpendingByCategoryByYear(user.getId(), year);
        }
        
        // Calculate total for percentage
        BigDecimal total = results.stream()
                .map(row -> (BigDecimal) row[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        List<CategorySpendingResponse> response = new ArrayList<>();
        for (Object[] row : results) {
            String categoryName = (String) row[0];
            BigDecimal totalSpent = (BigDecimal) row[1];
            Double percentage = total.compareTo(BigDecimal.ZERO) > 0 
                ? totalSpent.divide(total, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue()
                : 0.0;
            
            response.add(CategorySpendingResponse.builder()
                    .categoryName(categoryName)
                    .totalSpent(totalSpent)
                    .percentage(percentage)
                    .build());
        }
        
        return response;
    }

    public List<MonthlyActivityResponse> getMonthlyActivity(String email, Integer year) {
        User user = findByEmail(email);
        
        List<Object[]> results;
        if (year == null) {
            // All Time - get all years and aggregate by month
            results = orderRepository.findAllTimeMonthlyActivity(user.getId());
        } else {
            // Specific year
            results = orderRepository.findMonthlyActivity(user.getId(), year);
        }
        
        // Find max order count for percentage calculation
        Long maxOrders = results.stream()
                .map(row -> ((Number) row[2]).longValue())
                .max(Long::compareTo)
                .orElse(1L);
        
        List<MonthlyActivityResponse> response = new ArrayList<>();
        for (Object[] row : results) {
            Integer month = ((Number) row[0]).intValue();
            Integer resultYear = year != null ? year : LocalDate.now().getYear(); // For All Time, use current year for display
            Long orderCount = ((Number) row[2]).longValue();
            Double percentage = maxOrders > 0 
                ? (orderCount.doubleValue() / maxOrders.doubleValue()) * 100.0
                : 0.0;
            
            response.add(MonthlyActivityResponse.builder()
                    .month(getMonthName(month))
                    .year(resultYear)
                    .orderCount(orderCount)
                    .percentage(percentage)
                    .build());
        }
        
        return response;
    }

    private String getMonthName(int month) {
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        return months[month - 1];
    }

    // Admin use
    public List<com.example.backend.dto.AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> com.example.backend.dto.AdminUserResponse.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole() != null ? u.getRole().name() : null)
                        .status("ACTIVE")
                        .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                        .build())
                .toList();
    }

    public com.example.backend.dto.AdminUserResponse updateUserRole(String userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(com.example.backend.entity.Role.valueOf(newRole.toUpperCase()));
        user.setRoleType(newRole.toUpperCase());
        userRepository.save(user);
        return com.example.backend.dto.AdminUserResponse.builder()
                .id(user.getId()).name(user.getName()).email(user.getEmail())
                .role(user.getRole().name()).status("ACTIVE")
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    private UserProfileResponse toProfileResponse(User u) {
        return UserProfileResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole() != null ? u.getRole().name() : null)
                .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                .build();
    }
}
