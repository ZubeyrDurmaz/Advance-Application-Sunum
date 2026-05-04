package com.example.backend.controller;

import com.example.backend.dto.AddToCartRequest;
import com.example.backend.dto.CartResponse;
import com.example.backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        CartResponse cart = cartService.getCart(userDetails.getUsername());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addToCart(userDetails.getUsername(), request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String cartItemId,
            @RequestParam Integer quantity) {
        CartResponse cart = cartService.updateCartItem(userDetails.getUsername(), cartItemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeFromCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String cartItemId) {
        CartResponse cart = cartService.removeFromCart(userDetails.getUsername(), cartItemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
