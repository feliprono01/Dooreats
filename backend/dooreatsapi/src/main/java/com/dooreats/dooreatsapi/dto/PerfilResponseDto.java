
package com.dooreats.dooreatsapi.dto;

import com.dooreats.dooreatsapi.model.User;

import lombok.Data;

@Data
public class PerfilResponseDto {
    private Long id;
    private String role;
    private String nombreCompleto;

    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String area;
    private String oficina;

    public PerfilResponseDto(User user) {
        this.id = user.getId(); 
        this.role = user.getRol().name(); 
        this.nombreCompleto = user.getNombreCompleto(); 
        this.nombre = user.getNombre();
        this.apellido = user.getApellido();
        this.email = user.getEmail();
        this.telefono = user.getTelefono();
        this.area = user.getArea();
        this.oficina = user.getOficina();
    }
}