

package com.dooreats.dooreatsapi.security;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; 
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http, 
            JwtAuthFilter jwtAuthFilter, 
            AuthenticationProvider authenticationProvider,
            CorsConfigurationSource corsConfigurationSource
        ) throws Exception { 
        
        http
            // 1. Habilitar CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // 2. Deshabilitar CSRF
            .csrf(AbstractHttpConfigurer::disable)
            
            // 3. Configurar la autorización de rutas
            .authorizeHttpRequests(authz -> authz
                // Permite todas las peticiones OPTIONS (preflight de CORS)
                .requestMatchers(HttpMethod.OPTIONS).permitAll() 
                
                // (El resto de las reglas)
                .requestMatchers("/api/auth/**").permitAll() 
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN") 
                .requestMatchers("/api/empleado/**").hasAnyAuthority("ROLE_EMPLEADO", "ROLE_ADMIN") 
                .anyRequest().authenticated() 
            )
            
            // 4. Configurar el manejo de sesiones como STATELESS
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // 5. Configurar los headers
            .headers(headers -> headers
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin) 
            )
            
            // 6. Añadir el proveedor y el filtro
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}