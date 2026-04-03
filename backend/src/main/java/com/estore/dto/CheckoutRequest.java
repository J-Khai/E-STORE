package com.estore.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckoutRequest {
    private String cardNumber;
    private String paymentToken;
    private Boolean saveCard;
    private String expiryDate; // for new card creation
    private List<CheckoutItemRequest> items;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CheckoutItemRequest {
        private Long productId;
        private Integer quantity;
    }
}
