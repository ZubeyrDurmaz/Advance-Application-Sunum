package com.example.backend.service;

import com.example.backend.dto.ProductResponse;
import com.example.backend.entity.Product;
import com.example.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found: " + sku));
        return toResponse(product);
    }

    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return toResponse(product);
    }

    public List<ProductResponse> searchProducts(String query) {
        return productRepository.searchByName(query).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategory(String categoryId) {
        return productRepository.findByCategory_Id(categoryId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .sku(p.getSku())
                .unitPrice(p.getUnitPrice())
                .stockQuantity(p.getStockQuantity())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .storeName(p.getStore() != null ? p.getStore().getName() : null)
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                .build();
    }
}
