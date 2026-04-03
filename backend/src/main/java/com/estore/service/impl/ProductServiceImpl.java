package com.estore.service.impl;

import com.estore.dto.ProductResponseDTO;
import com.estore.model.Product;
import com.estore.repository.ProductRepository;
import com.estore.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public List<ProductResponseDTO> getAllProducts(Long categoryId) {
        // debug logging to see if parameters are actually coming through
        System.out.println("Processing products request for categoryId: " + categoryId);
        
        List<Product> products;
        if (categoryId != null && categoryId > 0) {
            products = productRepository.findByCategoryId(categoryId);
        } else {
            products = productRepository.findAll();
        }
        
        return products.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        return toDto(product);
    }

    private ProductResponseDTO toDto(Product p) {
        return ProductResponseDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .brand(p.getBrand())
                .price(p.getPrice())
                .stock(p.getStock())
                .imageUrl(p.getImageUrl())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .build();
    }
}
