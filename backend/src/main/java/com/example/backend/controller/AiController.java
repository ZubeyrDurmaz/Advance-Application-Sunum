package com.example.backend.controller;

import com.example.backend.dto.AiQueryRequest;
import com.example.backend.dto.AiQueryResponse;
import com.example.backend.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/query")
    public ResponseEntity<AiQueryResponse> query(@Valid @RequestBody AiQueryRequest request) {
        return ResponseEntity.ok(aiService.processQuery(request));
    }
}
