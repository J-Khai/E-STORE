package com.estore.repository;

import com.estore.model.Order;
import com.estore.model.OrderStatus;
import com.estore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT SUM(o.totalAmount) FROM Order o")
    Double sumTotalAmount();

    // sales since a specific date
    @Query(value = """
        SELECT DATE(o.created_at) as sale_date, SUM(o.total_amount) as daily_total
        FROM orders o
        WHERE o.status IN ('PAID', 'APPROVED', 'PROCESSED', 'SHIPPED')
        AND o.created_at >= :startDate
        GROUP BY DATE(o.created_at)
        ORDER BY DATE(o.created_at)
        """, nativeQuery = true)
    List<Object[]> findDailySalesSince(@org.springframework.data.repository.query.Param("startDate") LocalDateTime startDate);
    
    // just for the last 30 days
    @Query(value = """
        SELECT DATE(o.created_at) as sale_date, SUM(o.total_amount) as daily_total
        FROM orders o
        WHERE o.status IN ('PAID', 'APPROVED', 'PROCESSED', 'SHIPPED')
        AND o.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(o.created_at)
        ORDER BY DATE(o.created_at)
        """, nativeQuery = true)
    List<Object[]> findDailySalesLast30Days();

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
