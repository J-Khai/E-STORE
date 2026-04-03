package com.estore.service.impl;

import com.estore.dto.CategoryDTO;
import com.estore.model.Category;
import com.estore.repository.CategoryRepository;
import com.estore.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        return toDto(category);
    }

    private CategoryDTO toDto(Category c) {
        return CategoryDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .build();
    }
}
