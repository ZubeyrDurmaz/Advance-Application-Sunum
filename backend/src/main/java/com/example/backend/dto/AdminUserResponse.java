package com.example.backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminUserResponse {
    private String id;
    private String name;
    private String email;
    private String role;
    private String status;
    private String createdAt;
    private String lastActivity;
}
