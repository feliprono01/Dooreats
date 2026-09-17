
package com.dooreats.dooreatsapi.service;

import java.util.ArrayList; 

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dooreats.dooreatsapi.dto.AuthResponse;
import com.dooreats.dooreatsapi.dto.LoginRequest;
import com.dooreats.dooreatsapi.dto.RegisterRequest;
import com.dooreats.dooreatsapi.model.Role;
import com.dooreats.dooreatsapi.model.User;
import com.dooreats.dooreatsapi.repository.UserRepository;
import com.dooreats.dooreatsapi.security.JwtService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Lógica de Registro
     */
    public AuthResponse register(RegisterRequest request) {
        log.info("📝 Registro - Email: {}", request.getEmail());
        
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("⚠️ Email duplicado: {}", request.getEmail());
            throw new IllegalArgumentException("El email ya está en uso.");
        }

        User user = User.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .nombreCompleto(request.getNombre() + " " + request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(Role.ROLE_EMPLEADO)
                .diasAsistencia(new ArrayList<>()) // <-- ¡CAMBIO!
                .build();

        User savedUser = userRepository.save(user);
        log.info("✅ Usuario registrado: {}", savedUser.getEmail());

        String jwtToken = jwtService.generateToken(savedUser);

        return new AuthResponse(jwtToken, savedUser);
    }

    /**
     * Lógica de Login
     */
    public AuthResponse login(LoginRequest request) {
        log.info("🔐 Login - Email: {}", request.getEmail());
        
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            log.warn("❌ Login fallido: {}", request.getEmail());
            throw new BadCredentialsException("Email o contraseña incorrectos.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Error interno: usuario no encontrado después del login."));

        log.info("✅ Login exitoso: {}", user.getEmail());

        String jwtToken = jwtService.generateToken(user);

        return new AuthResponse(jwtToken, user);
    }
}