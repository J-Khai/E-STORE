package com.estore.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Order order;

    private Long productId;

    // Snapshots so history doesn't change when products are updated later
    private String productName;
    private String productBrand;
    private Double priceAtPurchase;
    private Integer quantity;
}
