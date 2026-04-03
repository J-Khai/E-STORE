package com.estore.controller;

import com.estore.dto.CartItemRequest;
import com.estore.dto.CartItemResponse;
import com.estore.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/items")
    public ResponseEntity<List<CartItemResponse>> getItems(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(cartService.getCartItems(user.getUsername()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartItemResponse> addItem(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(user.getUsername(), request));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<CartItemResponse> updateItem(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable("id") Long id,
            @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItem(user.getUsername(), id, request));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> removeItem(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable("id") Long id) {
        cartService.removeItem(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/items")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails user) {
        cartService.clearCart(user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
