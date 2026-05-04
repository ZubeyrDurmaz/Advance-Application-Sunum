package com.example.backend.controller;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Bug Condition Exploration Test for Products Not Loading Issue
 * 
 * **Validates: Requirements 1.1, 1.5, 2.1, 2.5**
 * 
 * Property 1: Bug Condition - Product List API Returns Data
 * 
 * This test encodes the EXPECTED behavior and is designed to FAIL on unfixed code.
 * When the bug exists, this test will fail, proving the bug condition.
 * When the bug is fixed, this test will pass, confirming the fix works.
 * 
 * Test Specification:
 * - Request method: GET
 * - Request URL: /api/products
 * - Request params: page=0, size=20
 * - Expected response status: 200 OK
 * - Expected response body: NOT NULL
 * - Expected response body.content: NOT NULL
 * - Expected response body.content.length: > 0
 * - Expected response body.totalElements: > 0
 * - Expected response body.totalPages: > 0
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 * GOAL: Surface counterexamples that demonstrate the bug exists.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerBugConditionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductService productService;

    @Test
    void testBugCondition_ProductListAPIReturnsData() throws Exception {
        // GIVEN: Valid pagination parameters
        int page = 0;
        int size = 20;

        // WHEN: GET request to /api/products with pagination parameters
        MvcResult result = mockMvc.perform(get("/api/products")
                .param("page", String.valueOf(page))
                .param("size", String.valueOf(size))
                .contentType(MediaType.APPLICATION_JSON))
                // THEN: Response status should be 200 OK
                .andExpect(status().isOk())
                .andReturn();

        // THEN: Response body should not be null
        String responseBody = result.getResponse().getContentAsString();
        assertNotNull(responseBody, "Response body should not be null");
        assertFalse(responseBody.isEmpty(), "Response body should not be empty");

        // THEN: Parse response as paginated response
        @SuppressWarnings("unchecked")
        Map<String, Object> paginatedResponse = objectMapper.readValue(responseBody, Map.class);
        
        // THEN: Response should contain 'content' field
        assertTrue(paginatedResponse.containsKey("content"), 
            "Response should contain 'content' field");
        
        Object contentObj = paginatedResponse.get("content");
        assertNotNull(contentObj, "Response body.content should not be null");
        
        // THEN: Content should be a list
        assertTrue(contentObj instanceof List, "Content should be a List");
        
        @SuppressWarnings("unchecked")
        List<Object> content = (List<Object>) contentObj;
        
        // THEN: Content should have length > 0 (products should be returned)
        assertTrue(content.size() > 0, 
            "Response body.content should have length > 0 (expected products to be returned, but got empty list)");

        // THEN: Response should contain pagination metadata
        assertTrue(paginatedResponse.containsKey("totalElements"), 
            "Response should contain 'totalElements' field");
        assertTrue(paginatedResponse.containsKey("totalPages"), 
            "Response should contain 'totalPages' field");
        assertTrue(paginatedResponse.containsKey("currentPage"), 
            "Response should contain 'currentPage' field");
        assertTrue(paginatedResponse.containsKey("size"), 
            "Response should contain 'size' field");

        // THEN: Pagination metadata should have valid values
        int totalElements = (Integer) paginatedResponse.get("totalElements");
        int totalPages = (Integer) paginatedResponse.get("totalPages");
        
        assertTrue(totalElements > 0, 
            "totalElements should be > 0 (expected products in database)");
        assertTrue(totalPages > 0, 
            "totalPages should be > 0");

        // Additional verification: Check that products have expected structure
        @SuppressWarnings("unchecked")
        Map<String, Object> firstProduct = (Map<String, Object>) content.get(0);
        
        assertTrue(firstProduct.containsKey("id"), "Product should have 'id' field");
        assertTrue(firstProduct.containsKey("name"), "Product should have 'name' field");
        assertTrue(firstProduct.containsKey("unitPrice"), "Product should have 'unitPrice' field");
        
        System.out.println("✓ Bug condition test passed: Product list API returns data correctly");
        System.out.println("  - Returned " + content.size() + " products");
        System.out.println("  - Total elements: " + totalElements);
        System.out.println("  - Total pages: " + totalPages);
    }

    @Test
    void testBugCondition_ProductListAPIReturnsDataWithDifferentPageSize() throws Exception {
        // GIVEN: Different pagination parameters
        int page = 0;
        int size = 10;

        // WHEN: GET request to /api/products with different page size
        MvcResult result = mockMvc.perform(get("/api/products")
                .param("page", String.valueOf(page))
                .param("size", String.valueOf(size))
                .contentType(MediaType.APPLICATION_JSON))
                // THEN: Response status should be 200 OK
                .andExpect(status().isOk())
                .andReturn();

        // THEN: Response should contain paginated data
        String responseBody = result.getResponse().getContentAsString();
        
        @SuppressWarnings("unchecked")
        Map<String, Object> paginatedResponse = objectMapper.readValue(responseBody, Map.class);
        
        @SuppressWarnings("unchecked")
        List<Object> content = (List<Object>) paginatedResponse.get("content");
        
        // THEN: Content should not be empty
        assertTrue(content.size() > 0, 
            "Response body.content should have length > 0");
        
        // THEN: Content size should respect the page size parameter (or be less if fewer products exist)
        assertTrue(content.size() <= size, 
            "Content size should not exceed requested page size");

        System.out.println("✓ Bug condition test passed with page size " + size);
        System.out.println("  - Returned " + content.size() + " products");
    }

    @Test
    void testBugCondition_ProductListAPIReturnsDataForSecondPage() throws Exception {
        // GIVEN: Second page pagination parameters
        int page = 1;
        int size = 20;

        // WHEN: GET request to /api/products for second page
        MvcResult result = mockMvc.perform(get("/api/products")
                .param("page", String.valueOf(page))
                .param("size", String.valueOf(size))
                .contentType(MediaType.APPLICATION_JSON))
                // THEN: Response status should be 200 OK
                .andExpect(status().isOk())
                .andReturn();

        // THEN: Response should be properly formatted (even if empty for second page)
        String responseBody = result.getResponse().getContentAsString();
        
        @SuppressWarnings("unchecked")
        Map<String, Object> paginatedResponse = objectMapper.readValue(responseBody, Map.class);
        
        assertTrue(paginatedResponse.containsKey("content"), 
            "Response should contain 'content' field");
        assertTrue(paginatedResponse.containsKey("totalElements"), 
            "Response should contain 'totalElements' field");
        assertTrue(paginatedResponse.containsKey("currentPage"), 
            "Response should contain 'currentPage' field");
        
        int currentPage = (Integer) paginatedResponse.get("currentPage");
        assertEquals(page, currentPage, "Current page should match requested page");

        System.out.println("✓ Bug condition test passed for page " + page);
    }
}
