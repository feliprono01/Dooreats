
// Variable global para guardar todos los pedidos de la API
window.adminPedidosData = [];

/**
 * Formatea un string de fecha (ISO) a un formato legible.
 */
function formatearFecha(fechaIso) {
  const fecha = new Date(fechaIso);
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Carga todos los pedidos desde la API
 */
async function cargarPedidosAdmin() {
    const container = document.getElementById("pedidosContainer");
    const msgEl = document.getElementById("pedidosMessage");
    if (!container) return;

    container.innerHTML = "<p>Cargando pedidos...</p>";
    showMessage("pedidosMessage", "", true);

    try {
        console.log(" [Admin] Cargando todos los pedidos...");
        // Llama a GET /api/admin/pedidos
        const pedidos = await apiClient.get('/admin/pedidos');
        console.log(" [Admin] Pedidos recibidos:", pedidos);
        
        window.adminPedidosData = pedidos; // Guardar en variable global
        renderPedidos(); // Renderizar (sin filtro inicial)

    } catch (error) {
        console.error(" Error cargando pedidos:", error);
        container.innerHTML = "<p>Error al cargar los pedidos.</p>";
        showMessage("pedidosMessage", "Error: " + error.message, true);
    }
}

/**
 * Renderiza los pedidos (filtrando por día)
 */
function renderPedidos() {
    const container = document.getElementById("pedidosContainer");
    const diaSeleccionado = document.getElementById("filtroDia")?.value || "";

    if (!container) return;
    container.innerHTML = "";

    let pedidosFiltrados = [...window.adminPedidosData];

    // 1. Filtrar por día (si se seleccionó uno)
    if (diaSeleccionado) {
        pedidosFiltrados = pedidosFiltrados.filter(pedido => 
            pedido.items.some(item => item.dia === diaSeleccionado)
        );
    }

    if (pedidosFiltrados.length === 0) {
        container.innerHTML = "<p>No hay pedidos para mostrar con el filtro actual.</p>";
        return;
    }

    // Renderizar las cards
    pedidosFiltrados.forEach((pedido) => {
        const card = document.createElement("div");
        card.classList.add("pedido-card");
        
        // (El DTO de Pedido tiene 'id', 'fechaCreacion', 'estado', 'nombreUsuario', 'items')
        const itemsHtml = pedido.items.map(item => {
            const obsHtml = item.observaciones ? ` <em style="color:#666">(${item.observaciones})</em>` : "";
            return `<li><strong>${item.dia}:</strong> ${item.plato}${obsHtml}</li>`;
        }).join("");

        card.innerHTML = `
            <h3>${pedido.nombreUsuario} (Pedido #${pedido.id})</h3>
            <p><strong>Fecha:</strong> ${formatearFecha(pedido.fechaCreacion)}</p>
            <p><strong>Estado:</strong> ${pedido.estado}</p>
            <ul>${itemsHtml}</ul>
        `;
        container.appendChild(card);
    });
}

/**
 * Envía los pedidos filtrados (pendientes o en preparación) a la cocina
 */
async function mandarACocina() {
    const diaSeleccionado = document.getElementById("filtroDia")?.value || "";
    const msgEl = document.getElementById("pedidosMessage");
    const btn = document.getElementById("btnMandarCocina");

    // 1. Obtener la misma lista que está viendo el admin
    let pedidosFiltrados = [...window.adminPedidosData];
    if (diaSeleccionado) {
        pedidosFiltrados = pedidosFiltrados.filter(pedido => 
            pedido.items.some(item => item.dia === diaSeleccionado)
        );
    }

    // 2. De esa lista, tomar solo los que se pueden enviar
    // (Tu AdminService filtra por PENDIENTE o EN_PREPARACION)
    const idsParaEnviar = pedidosFiltrados
        .filter(p => p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION')
        .map(p => p.id);

    if (idsParaEnviar.length === 0) {
        showMessage("pedidosMessage", "No hay pedidos pendientes o en preparación en el filtro actual para enviar.", true);
        return;
    }

    // 3. Preparar el body para la API
    // (El backend espera { "pedidoIds": [1, 2, 3] })
    const body = { pedidoIds: idsParaEnviar };

    if (!confirm(`Se enviarán ${idsParaEnviar.length} pedidos a cocina. ¿Confirmar?`)) {
        return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";
    showMessage("pedidosMessage", "Enviando pedidos a cocina...", false);

    try {
        console.log(" [Admin] Enviando a cocina:", body);
        // Llama a POST /api/admin/pedidos/enviar-cocina
        const respuesta = await apiClient.post('/admin/pedidos/enviar-cocina', body);
        // (La API devuelve { "mensaje": "...", "cantidad": X })

        console.log(" [Admin] Pedidos enviados:", respuesta);
        showMessage("pedidosMessage", `Éxito: ${respuesta.cantidad} pedidos enviados a cocina.`, false);
        
        // Recargar la lista para ver los estados actualizados
        cargarPedidosAdmin();

    } catch (error) {
        console.error(" Error enviando a cocina:", error);
        showMessage("pedidosMessage", "Error: " + error.message, true);
    } finally {
        btn.disabled = false;
        btn.textContent = "Mandar pedidos filtrados a cocina";
    }
}


// ============================
// Inicialización de la pantalla
// ============================
document.addEventListener("DOMContentLoaded", () => {
    // Cargar pedidos al iniciar
    cargarPedidosAdmin();

    // Eventos UI
    const filtroDia = document.getElementById("filtroDia");
    const btnMandarCocina = document.getElementById("btnMandarCocina");

    // (El filtro ahora se aplica automáticamente al cambiar)
    if (filtroDia) {
        filtroDia.addEventListener("change", renderPedidos);
    }

    if (btnMandarCocina) {
        btnMandarCocina.addEventListener("click", mandarACocina);
    }
});