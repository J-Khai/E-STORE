package com.estore.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductResponseDTO {
    private Long id;
    private String name;
    private String description;
    private String brand;
    private Double price;
    private Integer stock;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;
}
