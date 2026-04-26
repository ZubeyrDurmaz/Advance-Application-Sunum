package com.example.backend.controller;

import com.example.backend.entity.Category;
import com.example.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getAllCategories() {
        List<Map<String, String>> categories = categoryRepository.findAll().stream()
                .map(c -> Map.of(
                        "id", c.getId(),
                        "name", c.getName()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }
}
