package com.estore.controller;

import com.estore.dto.ProductResponseDTO;
import com.estore.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAll(
            @RequestParam(name = "categoryId", required = false) Long categoryId) {
        // naming the param so it binds correctly
        return ResponseEntity.ok(productService.getAllProducts(categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
}
