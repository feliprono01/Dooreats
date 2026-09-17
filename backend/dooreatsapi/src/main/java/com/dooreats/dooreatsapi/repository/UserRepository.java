
package com.dooreats.dooreatsapi.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dooreats.dooreatsapi.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA creará automáticamente la consulta SQL
    // para buscar un usuario por su email.
    // Esto es crucial para el login.
    Optional<User> findByEmail(String email);

}