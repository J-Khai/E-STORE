package com.estore.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductDto {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer stock;
}
