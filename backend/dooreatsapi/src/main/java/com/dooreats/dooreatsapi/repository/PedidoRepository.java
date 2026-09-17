package com.dooreats.dooreatsapi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dooreats.dooreatsapi.model.Pedido; 

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    // Spring creará la consulta para buscar todos los pedidos
    // de un usuario, ordenados por fecha (el más nuevo primero).
    List<Pedido> findByUsuario_EmailOrderByFechaCreacionDesc(String email);
}