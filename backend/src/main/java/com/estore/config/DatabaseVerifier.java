package com.estore.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Component
public class DatabaseVerifier implements CommandLineRunner {

    private final DataSource dataSource;

    public DatabaseVerifier(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(2)) {
                System.out.println("[DB VERIFIER] Successfully connected to PostgreSQL database.");
            } else {
                System.out.println("[DB VERIFIER] Connection to PostgreSQL is not valid.");
            }
        } catch (SQLException e) {
            System.out.println("[DB VERIFIER] Failed to connect to PostgreSQL: " + e.getMessage());
        }
    }
}
