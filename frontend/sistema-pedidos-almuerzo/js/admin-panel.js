
async function cargarMetricas() {
    console.log("📥 Cargando métricas del admin...");

    const metricPedidosEl = document.getElementById("metricPedidos");
    const metricUsuariosEl = document.getElementById("metricUsuarios");
    const metricPlatosEl = document.getElementById("metricPlatos");

    try {
        // Hacemos las 3 llamadas a la API en paralelo
        const [pedidos, usuarios, menu] = await Promise.all([
            apiClient.get('/admin/pedidos'),    // Llama a GET /api/admin/pedidos
            apiClient.get('/admin/usuarios'),   // Llama a GET /api/admin/usuarios
            apiClient.get('/admin/menu')        // Llama a GET /api/admin/menu
        ]);

        console.log(" Métricas recibidas:", { pedidos, usuarios, menu });

        //  Pedidos
        if (metricPedidosEl && pedidos) {
            // (Filtramos por "hoy" - asumiendo que "hoy" es cualquier pedido PENDIENTE)
            const pedidosHoy = pedidos.filter(p => p.estado === 'PENDIENTE');
            metricPedidosEl.textContent = pedidosHoy.length;
        }

        // Usuarios
        if (metricUsuariosEl && usuarios) {
            metricUsuariosEl.textContent = usuarios.length;
        }

        //  Platos
        if (metricPlatosEl && menu) {
            // Sumamos la cantidad de platos de todos los días
            const totalPlatos = menu.reduce((total, dia) => total + dia.platos.length, 0);
            metricPlatosEl.textContent = totalPlatos;
        }

    } catch (error) {
        console.error(" Error cargando métricas:", error);
        if (metricPedidosEl) metricPedidosEl.textContent = "Error";
        if (metricUsuariosEl) metricUsuariosEl.textContent = "Error";
        if (metricPlatosEl) metricPlatosEl.textContent = "Error";
    }
}