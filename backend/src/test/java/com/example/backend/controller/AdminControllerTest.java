package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.AdminService;
import com.example.backend.service.AuditLogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AdminService adminService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AdminController adminController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
    }

    @Test
    void getAllUsers_ShouldReturnUserList() throws Exception {
        AdminUserResponse userResponse = AdminUserResponse.builder()
                .id("u1")
                .email("test@example.com")
                .role("INDIVIDUAL")
                .build();

        when(adminService.getAllUsers()).thenReturn(List.of(userResponse));

        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("u1"))
                .andExpect(jsonPath("$[0].email").value("test@example.com"));
    }

    @Test
    void updateUserRole_ShouldReturnUpdatedUser() throws Exception {
        AdminUserResponse userResponse = AdminUserResponse.builder()
                .id("u1")
                .email("test@example.com")
                .role("ADMIN")
                .build();

        when(adminService.updateUserRole("u1", "ADMIN")).thenReturn(userResponse);

        mockMvc.perform(put("/api/admin/users/u1/role")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("role", "ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("u1"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void getLogs_ShouldReturnLogList() throws Exception {
        AuditLogResponse log = AuditLogResponse.builder()
                .id("log1")
                .action("LOGIN")
                .build();

        when(auditLogService.getAllLogs()).thenReturn(List.of(log));

        mockMvc.perform(get("/api/admin/logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("log1"))
                .andExpect(jsonPath("$[0].action").value("LOGIN"));
    }

    @Test
    void createDiscount_ShouldReturnCreatedDiscount() throws Exception {
        DiscountCodeRequest request = new DiscountCodeRequest();
        request.setCode("SUMMER10");
        request.setDiscountType("PERCENTAGE");
        request.setDiscountValue(BigDecimal.valueOf(10.0));
        request.setMaxUses(100);

        DiscountCodeResponse response = DiscountCodeResponse.builder()
                .id("d1")
                .code("SUMMER10")
                .discountType("PERCENTAGE")
                .discountValue(BigDecimal.valueOf(10.0))
                .maxUses(100)
                .usedCount(0)
                .build();

        when(adminService.createDiscount(any(DiscountCodeRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/admin/discounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUMMER10"));
    }

    @Test
    void getAllProducts_ShouldReturnProductList() throws Exception {
        ProductResponse product = ProductResponse.builder()
                .id("p1")
                .name("Test Product")
                .unitPrice(BigDecimal.valueOf(50.0))
                .build();

        when(adminService.getAllProducts()).thenReturn(List.of(product));

        mockMvc.perform(get("/api/admin/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("p1"))
                .andExpect(jsonPath("$[0].name").value("Test Product"));
    }

    @Test
    void getLogsCsv_ShouldReturnCsvFile() throws Exception {
        AuditLogResponse log = AuditLogResponse.builder()
                .id("log1")
                .action("TEST")
                .timestamp("2026-04-26T12:00:00")
                .build();

        when(auditLogService.getAllLogs()).thenReturn(List.of(log));

        mockMvc.perform(get("/api/admin/logs/csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"audit_logs.csv\""))
                .andExpect(content().contentType("text/csv"));
    }
}
