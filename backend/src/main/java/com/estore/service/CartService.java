package com.estore.service;

import com.estore.dto.CartItemRequest;
import com.estore.dto.CartItemResponse;

import java.util.List;

public interface CartService {
    List<CartItemResponse> getCartItems(String email);
    CartItemResponse addItem(String email, CartItemRequest request);
    CartItemResponse updateItem(String email, Long cartItemId, CartItemRequest request);
    void removeItem(String email, Long cartItemId);
    void clearCart(String email);
}
