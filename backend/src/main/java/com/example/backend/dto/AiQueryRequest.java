package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record AiQueryRequest(
    @NotBlank @Size(max = 2000) String message,
    List<ConversationMessage> history
) {
    public record ConversationMessage(String role, String content) {}
}
