
package com.dooreats.dooreatsapi.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.dooreats.dooreatsapi.model.EstadoPedido;
import com.dooreats.dooreatsapi.model.Pedido;

import lombok.Data;

@Data
public class PedidoResponseDto {
    private Long id;
    private LocalDateTime fechaCreacion;
    private EstadoPedido estado;
    private List<PedidoItemResponseDto> items;
    
    // (Para que el Admin vea quién hizo el pedido)
    private String nombreUsuario; 

    public PedidoResponseDto(Pedido pedido) {
        this.id = pedido.getId();
        this.fechaCreacion = pedido.getFechaCreacion();
        this.estado = pedido.getEstado();
        this.items = pedido.getItems().stream()
                .map(PedidoItemResponseDto::new) 
                .collect(Collectors.toList());
        

        // (Obtenemos el nombre del usuario asociado al pedido)
        if (pedido.getUsuario() != null) {
            this.nombreUsuario = pedido.getUsuario().getNombreCompleto();
        } else {
            this.nombreUsuario = "Usuario Desconocido";
        }
    }
}