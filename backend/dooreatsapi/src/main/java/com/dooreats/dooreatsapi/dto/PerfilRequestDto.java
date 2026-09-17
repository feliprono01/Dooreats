package com.dooreats.dooreatsapi.dto;

import lombok.Data;

@Data
public class PerfilRequestDto {
    // Coincide con los campos de perfil.js
    private String nombre;
    private String apellido;
    private String telefono;
    private String area;
    private String oficina;
    // (Añadiremos dieta, alergias, notifs si los guardas en User)
}