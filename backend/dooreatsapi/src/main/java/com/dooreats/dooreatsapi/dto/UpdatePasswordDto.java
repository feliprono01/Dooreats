package com.dooreats.dooreatsapi.dto;

import lombok.Data;

@Data
public class UpdatePasswordDto {
    private String passActual;
    private String passNueva;
    // No necesitamos passRepite, la app lo valida
}