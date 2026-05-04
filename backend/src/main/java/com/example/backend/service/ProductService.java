package com.example.backend.service;

import com.example.backend.dto.ProductResponse;
import com.example.backend.entity.Product;
import com.example.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAllWithDetails().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySkuWithDetails(sku)
                .orElseThrow(() -> new RuntimeException("Product not found: " + sku));
        return toResponse(product);
    }

    public ProductResponse getProductById(String id) {
        Product product = productRepository.findByIdWithDetails(id)
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

    public Page<ProductResponse> getProductsFiltered(
            String search,
            String categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String availability,
            String sortBy,
            String sortDirection,
            int page,
            int size) {

        // Build specification for filtering
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search filter
            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), searchPattern),
                    cb.like(cb.lower(root.get("brand")), searchPattern),
                    cb.like(cb.lower(root.get("model")), searchPattern),
                    cb.like(cb.lower(root.get("description")), searchPattern)
                ));
            }

            // Category filter
            if (categoryId != null && !categoryId.isBlank()) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            // Price range filter
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("unitPrice"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("unitPrice"), maxPrice));
            }

            // Availability filter
            if (availability != null && !availability.isBlank()) {
                if ("in-stock".equalsIgnoreCase(availability)) {
                    predicates.add(cb.greaterThan(root.get("stockQuantity"), 0));
                } else if ("out-of-stock".equalsIgnoreCase(availability)) {
                    predicates.add(cb.equal(root.get("stockQuantity"), 0));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // Build sort
        Sort sort = buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(page, size, sort);

        // Execute query
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        // Map to response
        return productPage.map(this::toResponse);
    }

    private Sort buildSort(String sortBy, String sortDirection) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) 
            ? Sort.Direction.DESC 
            : Sort.Direction.ASC;

        return switch (sortBy.toLowerCase()) {
            case "price" -> Sort.by(direction, "unitPrice");
            case "stock" -> Sort.by(direction, "stockQuantity");
            case "created" -> Sort.by(direction, "createdAt");
            case "brand" -> Sort.by(direction, "brand");
            default -> Sort.by(direction, "name");
        };
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
                .imageUrl(p.getImageUrl())
                .description(p.getDescription())
                .brand(p.getBrand())
                .model(p.getModel())
                .movement(p.getMovement())
                .material(p.getMaterial())
                .diameter(p.getDiameter())
                .powerReserve(p.getPowerReserve())
                .waterResistance(p.getWaterResistance())
                .availabilityStatus(p.getAvailabilityStatus())
                .features(p.getFeatures() != null ? new ArrayList<>(p.getFeatures()) : new ArrayList<>())
                .images(p.getImages() != null ? new ArrayList<>(p.getImages()) : new ArrayList<>())
                .build();
    }
}
