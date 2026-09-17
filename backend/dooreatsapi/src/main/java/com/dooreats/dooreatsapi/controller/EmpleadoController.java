

package com.dooreats.dooreatsapi.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dooreats.dooreatsapi.dto.AsistenciaDto;
import com.dooreats.dooreatsapi.dto.MenuDto;
import com.dooreats.dooreatsapi.dto.PedidoRequestDto;
import com.dooreats.dooreatsapi.dto.PedidoResponseDto;
import com.dooreats.dooreatsapi.dto.PerfilRequestDto;
import com.dooreats.dooreatsapi.dto.PerfilResponseDto;
import com.dooreats.dooreatsapi.dto.UpdatePasswordDto;
import com.dooreats.dooreatsapi.service.EmpleadoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/empleado")
@RequiredArgsConstructor
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    @GetMapping("/hello")
    public ResponseEntity<String> getEmpleadoHello() {
        return ResponseEntity.ok("¡Hola Empleado! Tu token funciona.");
    }

    // Asistencia 
    @GetMapping("/asistencia")
    public ResponseEntity<List<String>> getAsistencia(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<String> asistencia = empleadoService.getAsistencia(userDetails.getUsername());
        return ResponseEntity.ok(asistencia);
    }

    @PutMapping("/asistencia")
    public ResponseEntity<Void> updateAsistencia(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody AsistenciaDto asistenciaDto
    ) {
        empleadoService.updateAsistencia(userDetails.getUsername(), asistenciaDto.getDias());
        return ResponseEntity.ok().build();
    }

    // Menú 
    @GetMapping("/menu")
    public ResponseEntity<List<MenuDto>> getMenu(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<MenuDto> menu = empleadoService.getMenuParaEmpleado(userDetails.getUsername());
        return ResponseEntity.ok(menu);
    }

    // Pedidos 
    @PostMapping("/pedidos")
    public ResponseEntity<List<PedidoResponseDto>> guardarPedido( 
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody PedidoRequestDto pedidoRequest
    ) {
        List<PedidoResponseDto> pedidosGuardados = empleadoService.guardarPedido(userDetails.getUsername(), pedidoRequest);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(pedidosGuardados);
    }

    @GetMapping("/historial")
    public ResponseEntity<List<PedidoResponseDto>> getHistorial(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<PedidoResponseDto> historial = empleadoService.getHistorial(userDetails.getUsername());
        return ResponseEntity.ok(historial);
    }
    
    @GetMapping("/pedidos/actual")
    public ResponseEntity<List<PedidoResponseDto>> getPedidosActuales( 
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<PedidoResponseDto> pedidos = empleadoService.getPedidosActuales(userDetails.getUsername());
        return ResponseEntity.ok(pedidos); 
    }

    // Perfil 
    @GetMapping("/perfil")
    public ResponseEntity<PerfilResponseDto> getPerfil(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(empleadoService.getPerfil(userDetails.getUsername()));
    }

    @PutMapping("/perfil")
    public ResponseEntity<PerfilResponseDto> updatePerfil(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody PerfilRequestDto perfilDto
    ) {
        PerfilResponseDto perfilActualizado = empleadoService.updatePerfil(userDetails.getUsername(), perfilDto);
        return ResponseEntity.ok(perfilActualizado);
    }

    @PutMapping("/perfil/password")
    public ResponseEntity<Void> changePassword(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody UpdatePasswordDto passwordDto
    ) {
        empleadoService.changePassword(userDetails.getUsername(), passwordDto);
        return ResponseEntity.ok().build();
    }

    // Repetir Pedido 
    @GetMapping("/pedidos/{id}")
    public ResponseEntity<PedidoResponseDto> getPedidoById(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long id 
    ) {
        PedidoResponseDto pedido = empleadoService.getPedidoById(id, userDetails.getUsername());
        return ResponseEntity.ok(pedido);
    }

    @PostMapping("/pedidos/repetir/{id}")
    public ResponseEntity<PedidoResponseDto> repetirPedido(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long id
    ) {
        PedidoResponseDto pedidoRepetido = empleadoService.repetirPedido(id, userDetails.getUsername());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(pedidoRepetido);
    }
}