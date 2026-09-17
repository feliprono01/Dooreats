package com.dooreats.dooreatsapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Esta excepción se lanzará cuando un pedido no se encuentre en la BD.
 * La anotación @ResponseStatus le dice a Spring que devuelva un 404 Not Found.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class PedidoNoEncontradoException extends RuntimeException {
    public PedidoNoEncontradoException(String message) {
        super(message);
    }
}