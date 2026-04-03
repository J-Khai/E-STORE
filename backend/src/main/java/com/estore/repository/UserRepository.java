package com.estore.repository;

import com.estore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u LEFT JOIN FETCH u.address WHERE u.email = :email")
    Optional<User> findByEmailWithAddress(@org.springframework.data.repository.query.Param("email") String email);

    Optional<User> findByEmail(String email);
}
