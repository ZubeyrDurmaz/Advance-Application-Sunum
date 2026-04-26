package com.example.backend.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;
}
