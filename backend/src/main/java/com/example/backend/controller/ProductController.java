package com.example.backend.controller;

import com.example.backend.dto.ProductResponse;
import com.example.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        List<ProductResponse> products;

        if (search != null && !search.isBlank()) {
            products = productService.searchProducts(search);
        } else if (categoryId != null && !categoryId.isBlank()) {
            products = productService.getProductsByCategory(categoryId);
        } else {
            products = productService.getAllProducts();
        }

        // If pagination params provided, return paginated response
        if (page != null && size != null && size > 0) {
            int totalElements = products.size();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            int fromIndex = Math.min(page * size, totalElements);
            int toIndex = Math.min(fromIndex + size, totalElements);
            List<ProductResponse> pageContent = products.subList(fromIndex, toIndex);

            return ResponseEntity.ok(Map.of(
                "content", pageContent,
                "totalElements", totalElements,
                "totalPages", totalPages,
                "currentPage", page,
                "size", size
            ));
        }

        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductResponse> getProductBySku(@PathVariable String sku) {
        return ResponseEntity.ok(productService.getProductBySku(sku));
    }
}
