package com.estore.controller;

import com.estore.model.Order;
import com.estore.model.OrderStatus;
import com.estore.model.Product;
import com.estore.repository.OrderRepository;
import com.estore.repository.ProductRepository;
import com.estore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final com.estore.repository.CartRepository cartRepository;
    private final com.estore.repository.PaymentMethodRepository paymentMethodRepository;

    // product endpoints

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable("id") Long id,
                                                  @RequestBody Map<String, Object> updates) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        if (updates.containsKey("stock")) p.setStock((Integer) updates.get("stock"));
        if (updates.containsKey("price")) p.setPrice(Double.valueOf(updates.get("price").toString()));
        if (updates.containsKey("name"))  p.setName((String) updates.get("name"));
        if (updates.containsKey("isFeatured"))  p.setIsFeatured((Boolean) updates.get("isFeatured"));
        return ResponseEntity.ok(productRepository.save(p));
    }
    // adjust stock by a certain amount like +5 or -3
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/products/{id}/inventory")
    public ResponseEntity<Product> updateInventoryDelta(@PathVariable("id") Long id,
                                                        @RequestBody Map<String, Integer> body) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        
        Integer delta = body.get("delta");
        if (delta != null) {
            int newStock = p.getStock() + delta;
            p.setStock(Math.max(0, newStock)); // prevent negative stock
        }
        
        return ResponseEntity.ok(productRepository.save(p));
    }
    // lets admin manually force an order from REJECTED to PAID
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/orders/{id}/approve")
    public ResponseEntity<Order> approveOrder(@PathVariable("id") Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        
        if (order.getStatus() != com.estore.model.OrderStatus.REJECTED) {
             throw new IllegalStateException("Only REJECTED orders can be manually approved.");
        }
        
        order.setStatus(com.estore.model.OrderStatus.PAID);
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @GetMapping("/analytics/sales")
    public ResponseEntity<List<java.util.Map<String, Object>>> getAnalytics() {
        List<Object[]> data = orderRepository.findDailySalesLast30Days();
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        
        for (Object[] row : data) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("date", row[0].toString());
            map.put("sales", row[1]);
            result.add(map);
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/sales/export")
    public ResponseEntity<byte[]> exportSalesPdf() {
        // dummy pdf data for now
        String mockContent = "Milestone 7: Sales Audit Report\nTotal Revenue: " + orderRepository.sumTotalAmount();
        byte[] bytes = mockContent.getBytes();
        
        return org.springframework.http.ResponseEntity.ok()
            .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales_report.pdf")
            .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
            .body(bytes);
    }
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productRepository.save(product));
    }

    // upload a new image for a product, saves to static folder and updates the url
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/products/{id}/image")
    public ResponseEntity<Product> uploadProductImage(@PathVariable("id") Long id,
                                                       @RequestParam("file") MultipartFile file) throws IOException {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        
        // save to the local images folder
        Path staticDir = Paths.get("src", "main", "resources", "static", "images");
        Files.createDirectories(staticDir);

        // use timestamp so we don't overwrite if files have the same name
        String filename = "product-" + id + "-" + System.currentTimeMillis() +
                getExtension(Objects.requireNonNull(file.getOriginalFilename()));
        Path target = staticDir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        product.setImageUrl("/images/" + filename);
        return ResponseEntity.ok(productRepository.save(product));
    }

    // order endpoints

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    // let admin change the status of an order
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> overrideOrderStatus(@PathVariable("id") Long id,
                                                   @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));

        String requested = body.get("status");
        if (requested == null || requested.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "status field is required"));
        }

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(requested.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Invalid status value. Must be one of: " +
                       Arrays.toString(OrderStatus.values())));
        }

        order.setStatus(newStatus);
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @GetMapping("/users")
    public ResponseEntity<List<com.estore.model.User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @org.springframework.transaction.annotation.Transactional
    @PutMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> updateUser(@PathVariable("id") Long id,
                                                            @RequestBody Map<String, Object> updates) {
        com.estore.model.User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        if (updates.containsKey("firstName")) user.setFirstName((String) updates.get("firstName"));
        if (updates.containsKey("lastName")) user.setLastName((String) updates.get("lastName"));

        if (updates.containsKey("address") && updates.get("address") instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, String> addrMap = (Map<String, String>) updates.get("address");
            com.estore.model.Address address = user.getAddress();
            
            if (address == null) {
                address = new com.estore.model.Address();
                address.setUser(user);
                user.setAddress(address);
            }
            
            if (addrMap.get("street") != null) address.setStreet(addrMap.get("street"));
            if (addrMap.get("city") != null) address.setCity(addrMap.get("city"));
            if (addrMap.get("state") != null) address.setState(addrMap.get("state"));
            if (addrMap.get("zip") != null) address.setZipCode(addrMap.get("zip"));
        }

        userRepository.save(user);
        
        Map<String, String> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Cloud record updated");
        return ResponseEntity.ok(res);
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/users/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        com.estore.model.User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        // clean up the cart and payment methods since they only belong to this user
        cartRepository.findByUser(user).ifPresent(cartRepository::delete);
        
        List<com.estore.model.PaymentMethod> methods = paymentMethodRepository.findByUserId(id);
        paymentMethodRepository.deleteAll(methods);

        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestParam(value = "window", defaultValue = "30D") String window) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime startDate;
        
        switch (window.toUpperCase()) {
            case "2W":  startDate = now.minusWeeks(2); break;
            case "6M":  startDate = now.minusMonths(6); break;
            case "1Y":  startDate = now.minusYears(1); break;
            case "ALL": startDate = java.time.LocalDateTime.of(2000, 1, 1, 0, 0); break;
            case "30D":
            default:    startDate = now.minusDays(30); break;
        }

        // get orders between the dates
        List<com.estore.model.Order> filteredOrders = orderRepository.findByCreatedAtBetween(startDate, now);
        
        double periodRevenue = filteredOrders.stream()
                .filter(o -> o.getStatus() != null && "PAID".equalsIgnoreCase(o.getStatus().name()))
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0.0)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue",  periodRevenue);
        stats.put("totalOrders",   filteredOrders.size());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalUsers",    userRepository.count());
        return ResponseEntity.ok(stats);
    }

    // daily totals for the graph
    @GetMapping("/analytics/daily-sales")
    public ResponseEntity<Map<String, Double>> getDailySales(@RequestParam(value = "window", defaultValue = "30D") String window) {
        java.time.LocalDateTime startDate;
        switch (window.toUpperCase()) {
            case "2W":  startDate = java.time.LocalDateTime.now().minusWeeks(2); break;
            case "6M":  startDate = java.time.LocalDateTime.now().minusMonths(6); break;
            case "1Y":  startDate = java.time.LocalDateTime.now().minusYears(1); break;
            case "ALL": startDate = java.time.LocalDateTime.of(2000, 1, 1, 0, 0); break;
            case "30D":
            default:    startDate = java.time.LocalDateTime.now().minusDays(30); break;
        }

        List<Object[]> rows = orderRepository.findDailySalesSince(startDate);

        // LinkedHashMap keeps the dates in order
        Map<String, Double> result = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String date = row[0].toString();
            Double total = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            result.put(date, total);
        }
        return ResponseEntity.ok(result);
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }
}
