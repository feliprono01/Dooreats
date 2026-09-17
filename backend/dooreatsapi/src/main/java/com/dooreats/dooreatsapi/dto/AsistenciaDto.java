

package com.dooreats.dooreatsapi.dto;

import java.util.List;

import lombok.Data;

@Data // (Lombok) Genera getters y setters
public class AsistenciaDto {
    // Debe coincidir con el JSON que enviará la app: { "dias": ["Lunes", "Martes"] }
    private List<String> dias;
}