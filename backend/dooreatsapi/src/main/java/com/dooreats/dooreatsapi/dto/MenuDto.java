

package com.dooreats.dooreatsapi.dto;

import java.util.List;

import com.dooreats.dooreatsapi.model.DiaSemana;
import com.dooreats.dooreatsapi.model.Menu;

import lombok.Data;

@Data // (Lombok) Genera getters y setters
public class MenuDto {
    
    // Coincide con la estructura de menus.json
    private DiaSemana dia;
    private List<String> platos;

    /**
     * Constructor de conveniencia para convertir
     * una Entidad (Menu) a un DTO (MenuDto).
     */
    public MenuDto(Menu menu) {
        this.dia = menu.getDia();
        this.platos = menu.getPlatos();
    }
}