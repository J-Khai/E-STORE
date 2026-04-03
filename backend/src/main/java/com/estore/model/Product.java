package com.estore.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String sku;

    private String name;
    @Column(length = 2000)
    private String description;
    private String brand;
    private Double price;
    private Integer stock;
    @Column(length = 1000)
    private String imageUrl;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"products", "hibernateLazyInitializer", "handler"})
    private Category category;
}
