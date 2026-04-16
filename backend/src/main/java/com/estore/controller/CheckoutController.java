package com.estore.controller;

import com.estore.dto.CheckoutRequest;
import com.estore.dto.CheckoutResponse;
import com.estore.service.OrderService;
import com.estore.service.impl.OrderServiceImpl.InsufficientStockForCheckoutException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final OrderService orderService;

    // this is the main endpoint that starts the checkout logic when a user buys their cart
    @PostMapping
    public ResponseEntity<?> checkout(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody CheckoutRequest request) {
        try {
            CheckoutResponse response = orderService.checkout(user.getUsername(), request);
            if ("PAYMENT_FAILED".equals(response.getStatus())) {
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(response);
        } catch (InsufficientStockForCheckoutException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            // log error and return it to the frontend
            System.err.println("FATAL CHECKOUT ERROR: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Internal System Fault: " + ex.getMessage()));
        }
    }
}
