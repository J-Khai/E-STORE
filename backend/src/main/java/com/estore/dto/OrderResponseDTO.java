package com.estore.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponseDTO {
    private Long id;
    private String status;
    private Double totalAmount;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDTO> items;

    @Data
    @Builder
    public static class OrderItemResponseDTO {
        private Long productId;
        private String productName;
        private String productBrand;
        private Double priceAtPurchase;
        private Integer quantity;
    }
}
