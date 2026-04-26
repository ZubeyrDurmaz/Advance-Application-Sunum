package com.example.backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String name;
    private String email;
    private String role;
    private String createdAt;
}
