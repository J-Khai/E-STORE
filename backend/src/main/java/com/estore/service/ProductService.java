package com.estore.service;

import com.estore.dto.ProductResponseDTO;
import java.util.List;

public interface ProductService {
    List<ProductResponseDTO> getAllProducts(Long categoryId);
    ProductResponseDTO getProductById(Long id);
}
