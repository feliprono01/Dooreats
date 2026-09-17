

package com.dooreats.dooreatsapi.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.dooreats.dooreatsapi.model.DiaSemana;
import com.dooreats.dooreatsapi.model.Menu;
import com.dooreats.dooreatsapi.model.Role;
import com.dooreats.dooreatsapi.model.User;
import com.dooreats.dooreatsapi.repository.MenuRepository;
import com.dooreats.dooreatsapi.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component 
@RequiredArgsConstructor 
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MenuRepository menuRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Cargar Usuarios si la tabla está vacía
        if (userRepository.count() == 0) {
            System.out.println("Cargando usuarios de prueba...");
            
            User admin = User.builder()
                .nombre("Admin")
                .apellido("Dooreats")
                .nombreCompleto("Admin Dooreats")
                .email("admin@empresa.com")
                .password(passwordEncoder.encode("admin")) 
                .rol(Role.ROLE_ADMIN)
                .diasAsistencia(new ArrayList<>()) // <-- ¡CAMBIO!
                .build();
            
            User empleado = User.builder()
                .nombre("Test")
                .apellido("Empleado")
                .nombreCompleto("Test Empleado")
                .email("test@empresa.com")
                .password(passwordEncoder.encode("password123")) 
                .rol(Role.ROLE_EMPLEADO)
                .diasAsistencia(new ArrayList<>()) // <-- ¡CAMBIO!
                .build();

            userRepository.saveAll(List.of(admin, empleado));
            System.out.println("Usuarios cargados.");
        }

        // 2. Cargar Menú Semanal si la tabla está vacía
        if (menuRepository.count() == 0) {
            System.out.println("Cargando menú semanal de prueba...");

            Menu lunes = new Menu();
            lunes.setDia(DiaSemana.LUNES);
            lunes.setPlatos(List.of("Milanesa con puré", "Ensalada César", "Pastas con salsa roja"));

            Menu martes = new Menu();
            martes.setDia(DiaSemana.MARTES);
            martes.setPlatos(List.of("Pollo al horno con papas", "Tarta de verduras", "Hamburguesa completa"));

            Menu miercoles = new Menu();
            miercoles.setDia(DiaSemana.MIERCOLES);
            miercoles.setPlatos(List.of("Pizza muzzarella", "Sopa de verduras", "Arroz con pollo"));

            Menu jueves = new Menu();
            jueves.setDia(DiaSemana.JUEVES);
            jueves.setPlatos(List.of("Matambre a la pizza", "Pollo con papas", "Guiso de lentejas"));

            Menu viernes = new Menu();
            viernes.setDia(DiaSemana.VIERNES);
            viernes.setPlatos(List.of("Milanesas con pure", "Canelones con salsa", "Empanadas de carne"));

            menuRepository.saveAll(List.of(lunes, martes, miercoles, jueves, viernes));
            System.out.println("Menú cargado.");
        }
    }
}