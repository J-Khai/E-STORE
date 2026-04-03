package com.estore.config;

import com.estore.model.Category;
import com.estore.model.Product;
import com.estore.repository.CategoryRepository;
import com.estore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public CommandLineRunner seedProducts(RestTemplate restTemplate) {
        return args -> {
            // fetch all 194 products currently on dummyjson
            String url = "https://dummyjson.com/products?limit=0";
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("products")) {
                System.out.println("DataSeeder: no response from DummyJSON, skipping.");
                return;
            }

            List<Map<?, ?>> products = (List<Map<?, ?>>) response.get("products");
            Map<String, Category> categoryCache = new HashMap<>();
            
            int newCount = 0;
            int updateCount = 0;

            for (Map<?, ?> p : products) {
                String categoryName = (String) p.get("category");

                Category category = categoryCache.computeIfAbsent(categoryName, name -> {
                    return categoryRepository.findByName(name).orElseGet(() -> {
                        Category newCat = Category.builder()
                                .name(name)
                                .description(name + " products")
                                .build();
                        return categoryRepository.save(newCat);
                    });
                });

                String sku = (String) p.get("sku");
                if (sku == null) {
                    sku = "SKU-" + p.get("id"); // fallback if api changes
                }

                // pull the high res image if available, else thumbnail
                List<String> images = (List<String>) p.get("images");
                String bestImage = (images != null && !images.isEmpty()) ? images.get(0) : (String) p.get("thumbnail");

                // upsert logic checks by sku first so we dont duplicate
                java.util.Optional<Product> existingOpt = productRepository.findBySku(sku);

                if (existingOpt.isPresent()) {
                    Product existing = existingOpt.get();
                    existing.setName((String) p.get("title"));
                    existing.setDescription((String) p.get("description"));
                    existing.setBrand((String) p.get("brand"));
                    existing.setPrice(((Number) p.get("price")).doubleValue());
                    existing.setStock(((Number) p.get("stock")).intValue());
                    existing.setImageUrl(bestImage);
                    existing.setCategory(category);
                    productRepository.save(existing);
                    updateCount++;
                } else {
                    Product product = Product.builder()
                            .sku(sku)
                            .name((String) p.get("title"))
                            .description((String) p.get("description"))
                            .brand((String) p.get("brand"))
                            .price(((Number) p.get("price")).doubleValue())
                            .stock(((Number) p.get("stock")).intValue())
                            .imageUrl(bestImage)
                            .category(category)
                            .build();
                    productRepository.save(product);
                    newCount++;
                }
            }

            System.out.println("Database Seeder Finished: " + newCount + " inserted, " + updateCount + " updated.");
        };
    }
}
