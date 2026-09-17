
package com.dooreats.dooreatsapi.service;

import java.time.LocalDateTime;
import java.util.ArrayList; 
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException; 
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dooreats.dooreatsapi.dto.MenuDto;
import com.dooreats.dooreatsapi.dto.PedidoItemDto;
import com.dooreats.dooreatsapi.dto.PedidoRequestDto;
import com.dooreats.dooreatsapi.dto.PedidoResponseDto;
import com.dooreats.dooreatsapi.dto.PerfilRequestDto;
import com.dooreats.dooreatsapi.dto.PerfilResponseDto;
import com.dooreats.dooreatsapi.dto.UpdatePasswordDto;
import com.dooreats.dooreatsapi.exception.PedidoNoEncontradoException;
import com.dooreats.dooreatsapi.model.DiaSemana;
import com.dooreats.dooreatsapi.model.EstadoPedido;
import com.dooreats.dooreatsapi.model.Menu;
import com.dooreats.dooreatsapi.model.Pedido;
import com.dooreats.dooreatsapi.model.PedidoItem;
import com.dooreats.dooreatsapi.model.User;
import com.dooreats.dooreatsapi.repository.MenuRepository;
import com.dooreats.dooreatsapi.repository.PedidoRepository;
import com.dooreats.dooreatsapi.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final UserRepository userRepository;
    private final MenuRepository menuRepository;
    private final PedidoRepository pedidoRepository;
    private final PasswordEncoder passwordEncoder;

    // Helper 
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));
    }

    /* --- LÓGICA DE ASISTENCIA --- */
    
    public List<String> getAsistencia(String userEmail) {
        User user = getUserByEmail(userEmail);
        return user.getDiasAsistencia();
    }
    
    @Transactional
    public void updateAsistencia(String userEmail, List<String> dias) {
        User user = getUserByEmail(userEmail);
        
        // 1. Limpiamos la lista existente (para borrar "Viernes")
        user.getDiasAsistencia().clear();
        // 2. Añadimos los nuevos días ("Lunes", "Martes")
        user.getDiasAsistencia().addAll(dias);
        // 3. Guardamos (Hibernate ahora sabe qué borrar y qué añadir)
        userRepository.save(user);
    }
    


    /* --- LÓGICA DE MENÚ  --- */
    
    public List<MenuDto> getMenuParaEmpleado(String userEmail) {
        List<String> diasAsistenciaStrings = getAsistencia(userEmail);
        List<DiaSemana> diasAsistenciaEnums = diasAsistenciaStrings.stream()
                .map(diaString -> DiaSemana.valueOf(diaString.toUpperCase()))
                .collect(Collectors.toList());
        
        List<Menu> menus = menuRepository.findByDiaInOrderByDia(diasAsistenciaEnums);
        
        return menus.stream()
                .map(MenuDto::new)
                .collect(Collectors.toList());
    }

    /* --- LÓGICA DE GUARDAR PEDIDO  --- */
    
    @Transactional
    public List<PedidoResponseDto> guardarPedido(String userEmail, PedidoRequestDto pedidoRequest) {
        User user = getUserByEmail(userEmail);
        List<Pedido> pedidosGuardados = new ArrayList<>();

        for (var entry : pedidoRequest.getPlatos().entrySet()) {
            String dia = entry.getKey();
            PedidoItemDto itemDto = entry.getValue();

            Pedido nuevoPedido = new Pedido();
            nuevoPedido.setUsuario(user);
            nuevoPedido.setFechaCreacion(LocalDateTime.now());
            nuevoPedido.setEstado(EstadoPedido.PENDIENTE);
            nuevoPedido.setItems(new ArrayList<>()); 

            PedidoItem item = new PedidoItem();
            item.setDia(dia);
            item.setPlato(itemDto.getPlato());
            item.setObservaciones(itemDto.getObservaciones());
            item.setPedido(nuevoPedido); 

            nuevoPedido.getItems().add(item);
            
            pedidosGuardados.add(pedidoRepository.save(nuevoPedido));
        }
        
        return pedidosGuardados.stream()
                .map(PedidoResponseDto::new)
                .collect(Collectors.toList());
    }

    /* --- LÓGICA DE HISTORIAL  --- */
    
    public List<PedidoResponseDto> getHistorial(String userEmail) {
        List<Pedido> pedidos = pedidoRepository.findByUsuario_EmailOrderByFechaCreacionDesc(userEmail);
        return pedidos.stream()
                .map(PedidoResponseDto::new)
                .collect(Collectors.toList());
    }

    /* --- LÓGICA DE PEDIDO ACTUAL --- */
    
    public List<PedidoResponseDto> getPedidosActuales(String userEmail) {
        List<Pedido> pedidos = pedidoRepository.findByUsuario_EmailOrderByFechaCreacionDesc(userEmail);
        
        List<Pedido> pedidosActuales = pedidos.stream()
            .filter(p -> p.getEstado() == EstadoPedido.PENDIENTE || p.getEstado() == EstadoPedido.EN_PREPARACION)
            .collect(Collectors.toList());
            
        return pedidosActuales.stream()
                .map(PedidoResponseDto::new)
                .collect(Collectors.toList());
    }


    /* --- LÓGICA DE PERFIL --- */

    public PerfilResponseDto getPerfil(String userEmail) {
        User user = getUserByEmail(userEmail);
        return new PerfilResponseDto(user);
    }

    @Transactional
    public PerfilResponseDto updatePerfil(String userEmail, PerfilRequestDto perfilDto) {
        User user = getUserByEmail(userEmail);
        user.setNombre(perfilDto.getNombre());
        user.setApellido(perfilDto.getApellido());
        user.setNombreCompleto(perfilDto.getNombre() + " " + perfilDto.getApellido());
        user.setTelefono(perfilDto.getTelefono());
        user.setArea(perfilDto.getArea());
        user.setOficina(perfilDto.getOficina());
        User userActualizado = userRepository.save(user);
        return new PerfilResponseDto(userActualizado);
    }

    @Transactional
    public void changePassword(String userEmail, UpdatePasswordDto passwordDto) {
        User user = getUserByEmail(userEmail);
        if (!passwordEncoder.matches(passwordDto.getPassActual(), user.getPassword())) {
            throw new BadCredentialsException("La contraseña actual no es correcta.");
        }
        if (passwordDto.getPassNueva().length() < 6) {
            throw new IllegalArgumentException("La nueva contraseña debe tener al menos 6 caracteres.");
        }
        user.setPassword(passwordEncoder.encode(passwordDto.getPassNueva()));
        userRepository.save(user);
    }

    /* --- LÓGICA DE REPETIR PEDIDO  --- */

    private Pedido findPedidoByIdAndUser(Long pedidoId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new PedidoNoEncontradoException("Pedido no encontrado con ID: " + pedidoId));
        
        if (!pedido.getUsuario().getId().equals(user.getId())) {
            throw new AccessDeniedException("No tienes permiso para ver este pedido.");
        }
        return pedido;
    }

    public PedidoResponseDto getPedidoById(Long pedidoId, String userEmail) {
        Pedido pedido = findPedidoByIdAndUser(pedidoId, userEmail);
        return new PedidoResponseDto(pedido);
    }

    @Transactional
    public PedidoResponseDto repetirPedido(Long pedidoId, String userEmail) {
        Pedido pedidoAntiguo = findPedidoByIdAndUser(pedidoId, userEmail);

        Pedido pedidoRepetido = new Pedido();
        pedidoRepetido.setUsuario(pedidoAntiguo.getUsuario()); 
        pedidoRepetido.setFechaCreacion(LocalDateTime.now());
        pedidoRepetido.setEstado(EstadoPedido.PENDIENTE); 
        pedidoRepetido.setItems(new ArrayList<>());

        for (PedidoItem itemAntiguo : pedidoAntiguo.getItems()) {
            PedidoItem itemNuevo = new PedidoItem();
            itemNuevo.setDia(itemAntiguo.getDia());
            itemNuevo.setPlato(itemAntiguo.getPlato());
            itemNuevo.setObservaciones(itemAntiguo.getObservaciones());
            itemNuevo.setPedido(pedidoRepetido); 
            
            pedidoRepetido.getItems().add(itemNuevo);
        }

        Pedido pedidoGuardado = pedidoRepository.save(pedidoRepetido);

        return new PedidoResponseDto(pedidoGuardado);
    }
}