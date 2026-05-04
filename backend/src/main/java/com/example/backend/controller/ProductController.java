package com.example.backend.controller;

import com.example.backend.dto.ProductResponse;
import com.example.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String availability,
            @RequestParam(required = false, defaultValue = "name") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDirection,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        // If pagination params provided, use paginated service
        if (page != null && size != null && size > 0) {
            Page<ProductResponse> productPage = productService.getProductsFiltered(
                search, categoryId, minPrice, maxPrice, availability, 
                sortBy, sortDirection, page, size
            );

            return ResponseEntity.ok(Map.of(
                "content", productPage.getContent(),
                "totalElements", productPage.getTotalElements(),
                "totalPages", productPage.getTotalPages(),
                "currentPage", productPage.getNumber(),
                "size", productPage.getSize(),
                "hasNext", productPage.hasNext(),
                "hasPrevious", productPage.hasPrevious()
            ));
        }

        // Legacy support: return all products without pagination
        List<ProductResponse> products;
        if (search != null && !search.isBlank()) {
            products = productService.searchProducts(search);
        } else if (categoryId != null && !categoryId.isBlank()) {
            products = productService.getProductsByCategory(categoryId);
        } else {
            products = productService.getAllProducts();
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
