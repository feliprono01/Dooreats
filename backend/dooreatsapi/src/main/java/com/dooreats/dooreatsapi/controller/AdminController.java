

package com.dooreats.dooreatsapi.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dooreats.dooreatsapi.dto.MenuDto;
import com.dooreats.dooreatsapi.dto.PedidoResponseDto;
import com.dooreats.dooreatsapi.dto.PerfilResponseDto;
import com.dooreats.dooreatsapi.service.AdminService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // Solo admins pueden acceder
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;

    /* --- ENDPOINTS DE MENÚ --- */
    
    /**
     * GET 
     * Obtener todo el menú semanal
     */
    @GetMapping("/menu")
    public ResponseEntity<List<MenuDto>> getAllMenus() {
        log.info("📥 GET /api/admin/menu");
        List<MenuDto> menus = adminService.getAllMenus();
        return ResponseEntity.ok(menus);
    }

    /**
     * POST 
     * Agregar un plato a un día
     */
    @PostMapping("/menu/agregar")
    public ResponseEntity<MenuDto> agregarPlato(@RequestBody Map<String, String> request) {
        String dia = request.get("dia");
        String plato = request.get("plato");
        
        log.info("📥 POST /api/admin/menu/agregar - Día: {}, Plato: {}", dia, plato);
        
        if (dia == null || plato == null || plato.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        MenuDto menuActualizado = adminService.agregarPlato(dia, plato.trim());
        return ResponseEntity.ok(menuActualizado);
    }

    /**
     * DELETE 
     * Eliminar un plato de un día
     */
    @DeleteMapping("/menu/eliminar")
    public ResponseEntity<MenuDto> eliminarPlato(@RequestBody Map<String, String> request) { 
        String dia = request.get("dia");
        String plato = request.get("plato"); 
        
        log.info("📥 DELETE /api/admin/menu/eliminar - Día: {}, Plato: {}", dia, plato); 
        
        if (dia == null || plato == null) { 
            return ResponseEntity.badRequest().build();
        }
        
        MenuDto menuActualizado = adminService.eliminarPlato(dia, plato); 
        return ResponseEntity.ok(menuActualizado);
    }

    /* --- ENDPOINTS DE PEDIDOS --- */
    
    /**
     * GET 
     * Obtener todos los pedidos
     */
    @GetMapping("/pedidos")
    public ResponseEntity<List<PedidoResponseDto>> getAllPedidos() {
        log.info("📥 GET /api/admin/pedidos");
        List<PedidoResponseDto> pedidos = adminService.getAllPedidos();
        return ResponseEntity.ok(pedidos);
    }
    
    /**
     * GET 
     * Obtener pedidos filtrados por día
     */
    @GetMapping("/pedidos/dia/{dia}")
    public ResponseEntity<List<PedidoResponseDto>> getPedidosByDia(@PathVariable String dia) {
        log.info("📥 GET /api/admin/pedidos/dia/{}", dia);
        List<PedidoResponseDto> pedidos = adminService.getPedidosByDia(dia);
        return ResponseEntity.ok(pedidos);
    }
    
    /**
     * PUT 
     * Cambiar estado de un pedido
     */
    @PutMapping("/pedidos/{id}/estado")
    public ResponseEntity<PedidoResponseDto> cambiarEstadoPedido(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String nuevoEstado = request.get("estado");
        
        log.info("📥 PUT /api/admin/pedidos/{}/estado - Estado: {}", id, nuevoEstado);
        
        if (nuevoEstado == null) {
            return ResponseEntity.badRequest().build();
        }
        
        PedidoResponseDto pedidoActualizado = adminService.cambiarEstadoPedido(id, nuevoEstado);
        return ResponseEntity.ok(pedidoActualizado);
    }
    
    /**
     * POST 
     * Enviar múltiples pedidos a cocina
     */
    @PostMapping("/pedidos/enviar-cocina")
    public ResponseEntity<Map<String, Object>> enviarPedidosACocina(
            @RequestBody Map<String, List<Long>> request) {
        List<Long> pedidoIds = request.get("pedidoIds");
        
        log.info("📥 POST /api/admin/pedidos/enviar-cocina - {} pedidos", pedidoIds != null ? pedidoIds.size() : 0);
        
        if (pedidoIds == null || pedidoIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        int count = adminService.enviarPedidosACocina(pedidoIds);
        
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", count + " pedidos enviados a cocina");
        response.put("cantidad", count);
        
        return ResponseEntity.ok(response);
    }

    /* --- ENDPOINTS DE USUARIOS --- */
    
    /**
     * GET 
     * Obtener todos los usuarios
     */
    @GetMapping("/usuarios")
    public ResponseEntity<List<PerfilResponseDto>> getAllUsuarios() {
        log.info("📥 GET /api/admin/usuarios");
        List<PerfilResponseDto> usuarios = adminService.getAllUsuarios();
        return ResponseEntity.ok(usuarios);
    }
    
    /**
     * GET 
     * Obtener un usuario por ID
     */
    @GetMapping("/usuarios/{id}")
    public ResponseEntity<PerfilResponseDto> getUsuarioById(@PathVariable Long id) {
        log.info("📥 GET /api/admin/usuarios/{}", id);
        PerfilResponseDto usuario = adminService.getUsuarioById(id);
        return ResponseEntity.ok(usuario);
    }
    
    /**
     * POST 
     * Crear un nuevo usuario
     */
    @PostMapping("/usuarios")
    public ResponseEntity<PerfilResponseDto> crearUsuario(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String nombre = request.get("nombre");
        String apellido = request.get("apellido");
        String rol = request.get("rol");
        String area = request.get("area");
        String oficina = request.get("oficina");
        String telefono = request.get("telefono");
        
        log.info("📥 POST /api/admin/usuarios - Email: {}", email);
        
        if (email == null || password == null || nombre == null || apellido == null || rol == null) {
            return ResponseEntity.badRequest().build();
        }
        
        PerfilResponseDto nuevoUsuario = adminService.crearUsuario(
            email, password, nombre, apellido, rol, area, oficina, telefono
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }
    
    /**
     * PUT 
     * Actualizar un usuario existente
     */
    @PutMapping("/usuarios/{id}")
    public ResponseEntity<PerfilResponseDto> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String nombre = request.get("nombre");
        String apellido = request.get("apellido");
        String area = request.get("area");
        String oficina = request.get("oficina");
        String telefono = request.get("telefono");
        String rol = request.get("rol");
        
        log.info("📥 PUT /api/admin/usuarios/{}", id);
        
        PerfilResponseDto usuarioActualizado = adminService.actualizarUsuario(
            id, nombre, apellido, area, oficina, telefono, rol
        );
        
        return ResponseEntity.ok(usuarioActualizado);
    }
    
    /**
     * DELETE 
     * Eliminar un usuario
     */
    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        log.info("📥 DELETE /api/admin/usuarios/{}", id);
        adminService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}