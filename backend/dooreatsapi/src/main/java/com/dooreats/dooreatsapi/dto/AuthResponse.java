
package com.dooreats.dooreatsapi.dto;

import com.dooreats.dooreatsapi.model.User;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    
    @JsonProperty("user")
    private UserInfo user;

    /**
     * Clase interna para la información del usuario
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserInfo {
        private Long id;
        private String email;
        private String nombre;
        private String apellido;
        private String nombreCompleto;
        private String role;
        private String area;
        private String oficina;
        private String telefono;
        
        /**
         * Constructor desde la entidad User
         */
        public UserInfo(User user) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.nombre = user.getNombre();
            this.apellido = user.getApellido();
            this.nombreCompleto = user.getNombreCompleto();
            this.role = user.getRol().name(); // Convertir enum a String
            this.area = user.getArea();
            this.oficina = user.getOficina();
            this.telefono = user.getTelefono();
        }
    }
    
    /**
     * Constructor convenience desde User y token
     */
    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = new UserInfo(user);
    }
}