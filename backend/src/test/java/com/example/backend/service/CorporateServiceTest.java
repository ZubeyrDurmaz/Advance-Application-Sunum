package com.example.backend.service;

import com.example.backend.dto.ProductRequest;
import com.example.backend.dto.ProductResponse;
import com.example.backend.entity.Product;
import com.example.backend.entity.Store;
import com.example.backend.entity.User;
import com.example.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CorporateServiceTest {

    @Mock private StoreRepository storeRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private AuditLogService auditLogService;

    @InjectMocks
    private CorporateService corporateService;

    private User owner;
    private Store store;
    private Product product;

    @BeforeEach
    void setUp() {
        owner = User.builder().id("u1").email("corp@test.com").name("Test Corp").build();
        store = Store.builder().id("s1").name("Corp Store").owner(owner).build();
        product = Product.builder().id("p1").name("Test").sku("T-1").unitPrice(BigDecimal.TEN).store(store).build();
    }

    @Test
    void createProduct_Successful() {
        ProductRequest req = new ProductRequest();
        req.setName("New");
        req.setSku("N-1");
        req.setUnitPrice(BigDecimal.ONE);
        
        when(userRepository.findByEmail("corp@test.com")).thenReturn(Optional.of(owner));
        when(storeRepository.findByOwner_Id("u1")).thenReturn(java.util.List.of(store));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId("new-p-1");
            return p;
        });

        ProductResponse res = corporateService.createProduct("corp@test.com", req);

        assertNotNull(res);
        assertEquals("New", res.getName());
        verify(auditLogService).logAction(eq("CORP_ADD_PRODUCT"), anyString(), eq("corp@test.com"), eq("new-p-1"));
    }

    @Test
    void deleteProduct_Unauthorized_ThrowsException() {
        Store otherStore = Store.builder().id("s2").build();
        Product otherProduct = Product.builder().id("p2").store(otherStore).build();

        when(userRepository.findByEmail("corp@test.com")).thenReturn(Optional.of(owner));
        when(storeRepository.findByOwner_Id("u1")).thenReturn(java.util.List.of(store));
        when(productRepository.findById("p2")).thenReturn(Optional.of(otherProduct));

        Exception e = assertThrows(RuntimeException.class, () -> corporateService.deleteProduct("corp@test.com", "p2"));
        assertEquals("Product does not belong to your store", e.getMessage());
        verify(productRepository, never()).deleteById(anyString());
    }
}
