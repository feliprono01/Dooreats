package com.dooreats.dooreatsapi.dto;

import java.util.Map;

import lombok.Data;

@Data
public class PedidoRequestDto {
    // Le decimos a Spring que espere un Mapa, donde la clave es el Día (String)
    // y el valor es el objeto PedidoItemDto
    private Map<String, PedidoItemDto> platos;
}