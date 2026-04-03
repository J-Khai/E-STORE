package com.estore.service.impl;

import com.estore.dto.CheckoutRequest;
import com.estore.dto.CheckoutResponse;
import com.estore.model.*;
import com.estore.repository.*;
import com.estore.service.CartService;
import com.estore.service.OrderService;
import com.estore.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final PaymentService paymentService;
    private final PaymentMethodRepository paymentMethodRepository;

    @Override
    @Transactional
    public CheckoutResponse checkout(String email, CheckoutRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // fresh prices from the db so the frontend cant pass manipulated values
        List<OrderItem> items = new ArrayList<>();
        double total = 0.0;

        for (CheckoutRequest.CheckoutItemRequest lineItem : request.getItems()) {
            Product product = productRepository.findById(lineItem.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + lineItem.getProductId()));

            if (lineItem.getQuantity() > product.getStock()) {
                throw new InsufficientStockForCheckoutException(product.getName(), product.getStock());
            }

            double lineTotal = product.getPrice() * lineItem.getQuantity();
            total += lineTotal;

            items.add(OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productBrand(product.getBrand())
                    .priceAtPurchase(product.getPrice())
                    .quantity(lineItem.getQuantity())
                    .build());
        }

        // save the order first before we check the card, that way we have a record either way
        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING_PAYMENT)
                .totalAmount(total)
                .build();
        order = orderRepository.save(order);

        for (OrderItem item : items) {
            item.setOrder(order);
        }
        order.setItems(items);
        order = orderRepository.save(order);

        // run the luhn algorithm to validate the card number unless using a saved payment token
        boolean isValid = false;

        if (request.getPaymentToken() != null && !request.getPaymentToken().trim().isEmpty()) {
            java.util.Optional<PaymentMethod> savedCard = paymentMethodRepository.findByGatewayToken(request.getPaymentToken());
            if (savedCard.isPresent() && savedCard.get().getUser().getId().equals(user.getId())) {
                isValid = true;
            }
        } else {
            isValid = paymentService.isValidLuhn(request.getCardNumber());
        }

        if (!isValid) {
            order.setStatus(OrderStatus.PAYMENT_FAILED);
            orderRepository.save(order);
            return CheckoutResponse.builder()
                    .orderId(order.getId())
                    .status(OrderStatus.PAYMENT_FAILED.name())
                    .message("Authorization Failed")
                    .totalAmount(total)
                    .build();
        }

        // if the user wants to save this, we do it here since we know it's valid
        if (Boolean.TRUE.equals(request.getSaveCard()) && request.getCardNumber() != null) {
            String lastFour = request.getCardNumber().substring(Math.max(0, request.getCardNumber().length() - 4));
            String token = java.util.UUID.randomUUID().toString();
            
            PaymentMethod newMethod = PaymentMethod.builder()
                    .user(user)
                    .gatewayToken(token)
                    .lastFourDigits(lastFour)
                    .cardBrand("CREDIT") // could be derived from first digits
                    // fallback to 12/99 if no expirydate 
                    .expirationDate(request.getExpiryDate() != null ? request.getExpiryDate() : "12/99") 
                    .build();
            paymentMethodRepository.save(newMethod);
        }

        // card passed so now we subtract the stock and clear the cart
        for (CheckoutRequest.CheckoutItemRequest lineItem : request.getItems()) {
            Product product = productRepository.findById(lineItem.getProductId()).orElseThrow();
            product.setStock(product.getStock() - lineItem.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);
        cartService.clearCart(email);

        return CheckoutResponse.builder()
                .orderId(order.getId())
                .status(OrderStatus.PAID.name())
                .message("Payment successful")
                .totalAmount(total)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.estore.dto.OrderResponseDTO> getMyOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(o -> com.estore.dto.OrderResponseDTO.builder()
                        .id(o.getId())
                        .status(o.getStatus().name())
                        .totalAmount(o.getTotalAmount())
                        .createdAt(o.getCreatedAt())
                        .items(o.getItems().stream().map(i -> com.estore.dto.OrderResponseDTO.OrderItemResponseDTO.builder()
                                .productId(i.getProductId())
                                .productName(i.getProductName())
                                .productBrand(i.getProductBrand())
                                .priceAtPurchase(i.getPriceAtPurchase())
                                .quantity(i.getQuantity())
                                .build()).toList())
                        .build())
                .toList();
    }

    // used this inner class so the controller can catch stock errors specifically
    public static class InsufficientStockForCheckoutException extends RuntimeException {
        public final String productName;
        public final int available;

        public InsufficientStockForCheckoutException(String productName, int available) {
            super("Insufficient stock for \"" + productName + "\". Only " + available + " left.");
            this.productName = productName;
            this.available = available;
        }
    }
}
