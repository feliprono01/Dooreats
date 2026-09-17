package com.dooreats.dooreatsapi.dto;

import com.dooreats.dooreatsapi.model.PedidoItem;

import lombok.Data;

@Data
public class PedidoItemResponseDto {
    private String dia;
    private String plato;
    private String observaciones;

    public PedidoItemResponseDto(PedidoItem item) {
        this.dia = item.getDia();
        this.plato = item.getPlato();
        this.observaciones = item.getObservaciones();
    }
}