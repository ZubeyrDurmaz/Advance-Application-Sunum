package com.example.backend.service;

import com.example.backend.dto.AdminUserResponse;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private AuditLogService auditLogService;

    @InjectMocks
    private AdminService adminService;

    @Test
    void updateUserRole_Successful() {
        User user = User.builder().id("u1").role(Role.INDIVIDUAL).build();
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        AdminUserResponse response = adminService.updateUserRole("u1", "CORPORATE");

        assertEquals("CORPORATE", response.getRole());
        assertEquals(Role.CORPORATE, user.getRole());
        verify(auditLogService).logAction(eq("ADMIN_UPDATE_USER_ROLE"), anyString(), eq("ADMIN"), eq("u1"));
    }

    @Test
    void updateUserRole_InvalidRole_ThrowsException() {
        User user = User.builder().id("u1").role(Role.INDIVIDUAL).build();
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));

        Exception e = assertThrows(RuntimeException.class, () -> adminService.updateUserRole("u1", "INVALID_ROLE"));
        assertEquals("Invalid role", e.getMessage());
        verify(userRepository, never()).save(any());
    }
}
