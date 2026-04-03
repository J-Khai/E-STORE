package com.estore.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItemRequest {
    private Long productId;
    private Integer quantity;
}
