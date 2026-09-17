
package com.dooreats.dooreatsapi.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice // Le dice a Spring que esta clase vigila todos los Controladores
public class GlobalExceptionHandler {

    /**
     * Captura el error que se lanza cuando el email no existe
     * o la contraseña es incorrecta.
     */
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED) // Devuelve un 401
    public ResponseEntity<Object> handleBadCredentials(BadCredentialsException ex) {
        // Devuelve el JSON que nuestra app React Native espera
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Email o contraseña incorrectos."));
    }

    /**
     * Captura el error que lanzamos en AuthService si el email ya existe
     * durante el registro.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST) // Devuelve un 400
    public ResponseEntity<Object> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }
}