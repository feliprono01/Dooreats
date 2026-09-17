
package com.dooreats.dooreatsapi.service;

import java.util.ArrayList; 
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dooreats.dooreatsapi.dto.MenuDto;
import com.dooreats.dooreatsapi.dto.PedidoResponseDto;
import com.dooreats.dooreatsapi.dto.PerfilResponseDto;
import com.dooreats.dooreatsapi.exception.PedidoNoEncontradoException;
import com.dooreats.dooreatsapi.model.DiaSemana;
import com.dooreats.dooreatsapi.model.EstadoPedido;
import com.dooreats.dooreatsapi.model.Menu;
import com.dooreats.dooreatsapi.model.Pedido;
import com.dooreats.dooreatsapi.model.Role;
import com.dooreats.dooreatsapi.model.User;
import com.dooreats.dooreatsapi.repository.MenuRepository;
import com.dooreats.dooreatsapi.repository.PedidoRepository;
import com.dooreats.dooreatsapi.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final MenuRepository menuRepository;
    private final PedidoRepository pedidoRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /* --- GESTIÓN DE MENÚ --- */
    
    /**
     * Obtener todo el menú semanal
     */
    public List<MenuDto> getAllMenus() {
        log.info("📋 Obteniendo todo el menú semanal (ordenado)");
        // --- ¡CAMBIO AQUÍ! ---
        // (findAll -> findAllByOrderByDia)
        List<Menu> menus = menuRepository.findAllByOrderByDia();
        return menus.stream()
                .map(MenuDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Agregar un plato a un día específico
     */
    @Transactional
    public MenuDto agregarPlato(String diaString, String plato) {
        log.info("➕ Agregando plato '{}' al día {}", plato, diaString);
        
        DiaSemana dia;
        try {
            dia = DiaSemana.valueOf(diaString.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Día inválido: " + diaString);
        }
        
        Menu menu = menuRepository.findByDia(dia)
                .orElseThrow(() -> new IllegalArgumentException("No existe menú para el día: " + diaString));
        
        menu.getPlatos().add(plato);
        Menu menuActualizado = menuRepository.save(menu);
        
        log.info("✅ Plato agregado exitosamente");
        return new MenuDto(menuActualizado);
    }

    /**
     * Eliminar un plato de un día específico
     */
    @Transactional
    public MenuDto eliminarPlato(String diaString, String plato) {
        log.info("🗑️ Eliminando plato {} del día {}", plato, diaString);
        
        DiaSemana dia;
        try {
            dia = DiaSemana.valueOf(diaString.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Día inválido: " + diaString);
        }
        
        Menu menu = menuRepository.findByDia(dia)
                .orElseThrow(() -> new IllegalArgumentException("No existe menú para el día: " + diaString));
        
        boolean eliminado = menu.getPlatos().remove(plato); 
        
        if (!eliminado) { 
            throw new IllegalArgumentException("No se encontró el plato: " + plato);
        }
        
        Menu menuActualizado = menuRepository.save(menu);
        
        log.info("✅ Plato '{}' eliminado exitosamente", plato);
        return new MenuDto(menuActualizado);
    }

    /* --- GESTIÓN DE PEDIDOS --- */
    
    /**
     * Obtener todos los pedidos
     */
    public List<PedidoResponseDto> getAllPedidos() {
        log.info("📋 Obteniendo todos los pedidos");
        List<Pedido> pedidos = pedidoRepository.findAll();
        return pedidos.stream()
                .map(PedidoResponseDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener pedidos filtrados por día
     */
    public List<PedidoResponseDto> getPedidosByDia(String dia) {
        log.info("📋 Obteniendo pedidos del día: {}", dia);
        
        List<Pedido> todosPedidos = pedidoRepository.findAll();
        List<Pedido> pedidosFiltrados = todosPedidos.stream()
                .filter(pedido -> pedido.getItems().stream()
                        .anyMatch(item -> item.getDia().equalsIgnoreCase(dia)))
                .collect(Collectors.toList());
        
        return pedidosFiltrados.stream()
                .map(PedidoResponseDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Cambiar estado de un pedido
     */
    @Transactional
    public PedidoResponseDto cambiarEstadoPedido(Long pedidoId, String nuevoEstado) {
        log.info("🔄 Cambiando estado del pedido {} a {}", pedidoId, nuevoEstado);
        
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new PedidoNoEncontradoException("Pedido no encontrado con ID: " + pedidoId));
        
        EstadoPedido estadoPedido;
        try {
            estadoPedido = EstadoPedido.valueOf(nuevoEstado.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Estado inválido: " + nuevoEstado);
        }
        
        pedido.setEstado(estadoPedido);
        Pedido pedidoActualizado = pedidoRepository.save(pedido);
        
        log.info("✅ Estado del pedido actualizado");
        return new PedidoResponseDto(pedidoActualizado);
    }
    
    /**
     * Enviar múltiples pedidos a cocina (cambiar estado a ENVIADO_A_COCINA)
     */
    @Transactional
    public int enviarPedidosACocina(List<Long> pedidoIds) {
        log.info("👨‍🍳 Enviando {} pedidos a cocina", pedidoIds.size());
        
        int count = 0;
        for (Long id : pedidoIds) {
            try {
                Pedido pedido = pedidoRepository.findById(id).orElse(null);
                if (pedido != null && 
                    (pedido.getEstado() == EstadoPedido.PENDIENTE || 
                     pedido.getEstado() == EstadoPedido.EN_PREPARACION)) {
                    pedido.setEstado(EstadoPedido.ENVIADO_A_COCINA);
                    pedidoRepository.save(pedido);
                    count++;
                }
            } catch (Exception e) {
                log.error("Error al enviar pedido {}: {}", id, e.getMessage());
            }
        }
        
        log.info("✅ {} pedidos enviados a cocina", count);
        return count;
    }

    /* --- GESTIÓN DE USUARIOS --- */
    
    /**
     * Obtener todos los usuarios
     */
    public List<PerfilResponseDto> getAllUsuarios() {
        log.info("👥 Obteniendo todos los usuarios");
        List<User> usuarios = userRepository.findAll();
        return usuarios.stream()
                .map(PerfilResponseDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener un usuario por ID
     */
    public PerfilResponseDto getUsuarioById(Long id) {
        log.info("👤 Obteniendo usuario con ID: {}", id);
        User usuario = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        return new PerfilResponseDto(usuario);
    }
    
    /**
     * Crear un nuevo usuario
     */
    @Transactional
    public PerfilResponseDto crearUsuario(String email, String password, String nombre, 
                                         String apellido, String rol, String area, 
                                         String oficina, String telefono) {
        log.info("➕ Creando nuevo usuario: {}", email);
        
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Ya existe un usuario con ese email");
        }
        
        Role roleEnum;
        try {
            roleEnum = Role.valueOf(rol.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Rol inválido: " + rol);
        }
        
        // Crear usuario
        User nuevoUsuario = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .nombre(nombre)
                .apellido(apellido)
                .nombreCompleto(nombre + " " + apellido)
                .rol(roleEnum)
                .area(area)
                .oficina(oficina)
                .telefono(telefono)
                .diasAsistencia(new ArrayList<>()) 
                .build();
        
        User usuarioGuardado = userRepository.save(nuevoUsuario);
        log.info("✅ Usuario creado exitosamente con ID: {}", usuarioGuardado.getId());
        
        return new PerfilResponseDto(usuarioGuardado);
    }
    
    /**
     * Actualizar un usuario existente
     */
    @Transactional
    public PerfilResponseDto actualizarUsuario(Long id, String nombre, String apellido, 
                                              String area, String oficina, String telefono, String rol) {
        log.info("🔄 Actualizando usuario con ID: {}", id);
        
        User usuario = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        
        if (nombre != null && !nombre.isEmpty()) {
            usuario.setNombre(nombre);
        }
        if (apellido != null && !apellido.isEmpty()) {
            usuario.setApellido(apellido);
        }
        if (nombre != null || apellido != null) {
            usuario.setNombreCompleto(
                (nombre != null ? nombre : usuario.getNombre()) + " " + 
                (apellido != null ? apellido : usuario.getApellido())
            );
        }
        if (area != null) {
            usuario.setArea(area);
        }
        if (oficina != null) {
            usuario.setOficina(oficina);
        }
        if (telefono != null) {
            usuario.setTelefono(telefono);
        }
        if (rol != null && !rol.isEmpty()) {
            try {
                usuario.setRol(Role.valueOf(rol.toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Rol inválido: " + rol);
            }
        }
        
        User usuarioActualizado = userRepository.save(usuario);
        log.info("✅ Usuario actualizado exitosamente");
        
        return new PerfilResponseDto(usuarioActualizado);
    }
    
    /**
     * Eliminar un usuario
     */
    @Transactional
    public void eliminarUsuario(Long id) {
        log.info("🗑️ Eliminando usuario con ID: {}", id);
        
        User usuario = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        
        userRepository.delete(usuario);
        log.info("✅ Usuario eliminado exitosamente");
    }
}