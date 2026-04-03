package com.estore.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckoutResponse {
    private Long orderId;
    private String status;
    private String message;
    private Double totalAmount;
}
