
package com.dooreats.dooreatsapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    // Coincide con el formulario de RegisterScreen.tsx
    private String nombre;
    private String apellido;
    private String email;
    private String password;
}