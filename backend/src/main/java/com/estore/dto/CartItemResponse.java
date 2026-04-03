package com.estore.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String imageUrl;
    private Double price;
    private Integer quantity;
    private Integer stock;
    private String categoryName;

    // Alias so the frontend can use item.name or item.productName interchangeably
    @JsonProperty("name")
    public String getName() {
        return productName;
    }
}
