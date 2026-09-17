
package com.dooreats.dooreatsapi.repository;

import java.util.List;
import java.util.Optional; 

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dooreats.dooreatsapi.model.DiaSemana;
import com.dooreats.dooreatsapi.model.Menu;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    
    // Spring creará la consulta para buscar un menú por el enum DiaSemana
    Optional<Menu> findByDia(DiaSemana dia);


    // (findByDiaIn -> findByDiaInOrderByDia)
    List<Menu> findByDiaInOrderByDia(List<DiaSemana> dias);
    

    // (Lo usará el AdminService para obtener todos los menús ordenados)
    List<Menu> findAllByOrderByDia();
}