package com.example.backend.service;

import com.example.backend.dto.AddToCartRequest;
import com.example.backend.dto.CartResponse;
import com.example.backend.entity.Cart;
import com.example.backend.entity.CartItem;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.CartRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Get user's cart
     */
    public CartResponse getCart(String username) {
        User user = getUserByUsername(username);
        Cart cart = getOrCreateCart(user);
        return convertToResponse(cart);
    }

    /**
     * Add item to cart
     */
    public CartResponse addToCart(String username, AddToCartRequest request) {
        User user = getUserByUsername(username);
        Cart cart = getOrCreateCart(user);
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if item already exists in cart
        CartItem existingItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        if (existingItem != null) {
            // Update quantity
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(existingItem);
            log.info("Updated cart item quantity for product: {}", product.getName());
        } else {
            // Create new cart item
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .priceAtAddition(product.getUnitPrice())
                    .build();
            cart.addItem(cartItem);
            cartItemRepository.save(cartItem);
            log.info("Added new item to cart: {}", product.getName());
        }

        cartRepository.save(cart);
        return convertToResponse(cart);
    }

    /**
     * Update cart item quantity
     */
    public CartResponse updateCartItem(String username, String cartItemId, Integer quantity) {
        User user = getUserByUsername(username);
        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Verify cart item belongs to user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Access denied: Cart item does not belong to user");
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cart.removeItem(cartItem);
            cartItemRepository.delete(cartItem);
            log.info("Removed item from cart");
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
            log.info("Updated cart item quantity to: {}", quantity);
        }

        cartRepository.save(cart);
        return convertToResponse(cart);
    }

    /**
     * Remove item from cart
     */
    public CartResponse removeFromCart(String username, String cartItemId) {
        User user = getUserByUsername(username);
        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Verify cart item belongs to user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Access denied: Cart item does not belong to user");
        }

        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);
        cartRepository.save(cart);
        
        log.info("Removed item from cart");
        return convertToResponse(cart);
    }

    /**
     * Clear cart
     */
    public void clearCart(String username) {
        User user = getUserByUsername(username);
        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        
        if (cart != null) {
            cart.clearItems();
            cartItemRepository.deleteByCartId(cart.getId());
            cartRepository.save(cart);
            log.info("Cleared cart for user: {}", username);
        }
    }

    /**
     * Get or create cart for user
     */
    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    /**
     * Get user by username
     */
    private User getUserByUsername(String username) {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Convert Cart entity to CartResponse DTO
     */
    private CartResponse convertToResponse(Cart cart) {
        BigDecimal subtotal = cart.getItems().stream()
                .map(item -> item.getPriceAtAddition().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Integer totalItems = cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        return CartResponse.builder()
                .id(cart.getId())
                .items(cart.getItems().stream()
                        .map(this::convertItemToResponse)
                        .collect(Collectors.toList()))
                .subtotal(subtotal)
                .totalItems(totalItems)
                .build();
    }

    /**
     * Convert CartItem entity to CartItemResponse DTO
     */
    private CartResponse.CartItemResponse convertItemToResponse(CartItem item) {
        Product product = item.getProduct();
        BigDecimal total = item.getPriceAtAddition().multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartResponse.CartItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSku())
                .productImage(product.getImages() != null && !product.getImages().isEmpty() 
                        ? product.getImages().get(0) : null)
                .price(item.getPriceAtAddition())
                .quantity(item.getQuantity())
                .total(total)
                .build();
    }
}
