package com.estore.service;

import com.estore.dto.CategoryDTO;
import java.util.List;

public interface CategoryService {
    List<CategoryDTO> getAllCategories();
    CategoryDTO getCategoryById(Long id);
}
