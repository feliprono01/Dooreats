

package com.dooreats.dooreatsapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dooreats.dooreatsapi.dto.AuthResponse;
import com.dooreats.dooreatsapi.dto.LoginRequest;
import com.dooreats.dooreatsapi.dto.RegisterRequest;
import com.dooreats.dooreatsapi.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth") 
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint para /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request
    ) {
        // Llama al servicio para registrar y devuelve el token
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * Endpoint para /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request
    ) {
        // Llama al servicio para loguear y devuelve el token
        return ResponseEntity.ok(authService.login(request));
    }
}