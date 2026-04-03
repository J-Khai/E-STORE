package com.estore.service.impl;

import com.estore.dto.CartItemRequest;
import com.estore.dto.CartItemResponse;
import com.estore.exception.InsufficientStockException;
import com.estore.model.*;
import com.estore.repository.*;
import com.estore.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private Cart getOrCreateCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return cartRepository.findByUser(user).orElseGet(() -> {
            Cart cart = Cart.builder().user(user).build();
            return cartRepository.save(cart);
        });
    }

    private void validateStock(Product product, int requestedQty) {
        if (requestedQty > product.getStock()) {
            throw new InsufficientStockException(product.getStock());
        }
    }

    private CartItemResponse toDto(CartItem item) {
        Product p = item.getProduct();
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(p.getId())
                .productName(p.getName())
                .imageUrl(p.getImageUrl())
                .price(p.getPrice())
                .quantity(item.getQuantity())
                .stock(p.getStock())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .build();
    }

    @Override
    public List<CartItemResponse> getCartItems(String email) {
        Cart cart = getOrCreateCart(email);
        return cartItemRepository.findByCart(cart).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CartItemResponse addItem(String email, CartItemRequest request) {
        Cart cart = getOrCreateCart(email);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        validateStock(product, request.getQuantity());

        // If item already in cart, increment quantity
        CartItem item = cartItemRepository.findByCartAndProductId(cart, product.getId())
                .map(existing -> {
                    int newQty = existing.getQuantity() + request.getQuantity();
                    validateStock(product, newQty);
                    existing.setQuantity(newQty);
                    return existing;
                })
                .orElse(CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .quantity(request.getQuantity())
                        .build());

        return toDto(cartItemRepository.save(item));
    }

    @Override
    public CartItemResponse updateItem(String email, Long cartItemId, CartItemRequest request) {
        Cart cart = getOrCreateCart(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .filter(i -> i.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        validateStock(item.getProduct(), request.getQuantity());

        item.setQuantity(request.getQuantity());
        return toDto(cartItemRepository.save(item));
    }

    @Override
    public void removeItem(String email, Long cartItemId) {
        Cart cart = getOrCreateCart(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .filter(i -> i.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        cartItemRepository.delete(item);
    }

    @Override
    public void clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cartItemRepository.deleteAll(cartItemRepository.findByCart(cart));
    }
}
