

// Variable global para guardar todos los pedidos de la API
window.adminHistorialData = [];

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
async function cargarHistorialAdmin() {
    const cont = document.getElementById("historialContainer");
    const pCount = document.getElementById("historialCount");
    const msgEl = document.getElementById("historialMessage");
    if (!cont) return;

    cont.innerHTML = "<p>Cargando historial...</p>";
    pCount.textContent = "";
    showMessage("historialMessage", "", true);

    try {
        console.log(" [Admin] Cargando historial de pedidos...");
        const pedidos = await apiClient.get('/admin/pedidos');
        console.log(" [Admin] Historial recibido:", pedidos);
        
        // (Guardamos ordenado por fecha, más nuevos primero)
        window.adminHistorialData = pedidos.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
        renderHistorial(); // Renderizar (sin filtro inicial)

    } catch (error) {
        console.error(" Error cargando historial:", error);
        cont.innerHTML = "<p>Error al cargar el historial.</p>";
        showMessage("historialMessage", "Error: " + error.message, true);
    }
}

/**
 * Renderiza el historial (filtrando localmente)
 */
function renderHistorial() {
    const cont = document.getElementById("historialContainer");
    const pCount = document.getElementById("historialCount");
    if (!cont) return;

    // 1. Obtener valores de los filtros
    const diaSel = document.getElementById("filtroDia")?.value || "";
    const estSel = document.getElementById("filtroEstado")?.value || "";
    const txt = (document.getElementById("filtroTexto")?.value || "").toLowerCase().trim();

    let pedidosFiltrados = [...window.adminHistorialData];

    // 2. Aplicar filtros
    if (diaSel) {
        pedidosFiltrados = pedidosFiltrados.filter(p => p.items.some(item => item.dia === diaSel));
    }
    if (estSel) {
        pedidosFiltrados = pedidosFiltrados.filter(p => p.estado === estSel);
    }
    if (txt) {
        pedidosFiltrados = pedidosFiltrados.filter(p =>
            (p.nombreUsuario || "").toLowerCase().includes(txt) ||
            p.items.some(item => (item.plato || "").toLowerCase().includes(txt))
        );
    }

    // 3. Renderizar
    cont.innerHTML = "";
    pCount.textContent = `Resultados: ${pedidosFiltrados.length}`;

    if (pedidosFiltrados.length === 0) {
        cont.innerHTML = "<p>No hay pedidos para mostrar con los filtros actuales.</p>";
        return;
    }

    pedidosFiltrados.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("pedido-card");

        const itemsHtml = p.items.map(item => {
            const obsHtml = item.observaciones ? ` <em style="color:#666">(${item.observaciones})</em>` : "";
            return `<li><strong>${item.dia}:</strong> ${item.plato}${obsHtml}</li>`;
        }).join("");
        
        // Creamos las opciones del dropdown de estados
        const estados = ["PENDIENTE", "EN_PREPARACION", "ENVIADO_A_COCINA", "ENTREGADO"];
        const opcionesEstado = estados.map(estado => 
            `<option value="${estado}" ${p.estado === estado ? 'selected' : ''}>
                ${estado.replace('_', ' ')}
            </option>`
        ).join('');

        card.innerHTML = `
            <h3>${p.nombreUsuario} (Pedido #${p.id})</h3>
            <p><strong>Fecha:</strong> ${formatearFecha(p.fechaCreacion)}</p>
            <ul>${itemsHtml}</ul>
            
            <div class="form-estado-admin">
              <label for="estado-${p.id}"><strong>Estado:</strong></label>
              <select id="estado-${p.id}">
                ${opcionesEstado}
              </select>
              <button class="btn-small btn-primary" onclick="cambiarEstadoPedido(${p.id})">
                Cambiar
              </button>
            </div>
            `;
        
        cont.appendChild(card);
    });
}

/**
 * Limpia los filtros y vuelve a renderizar
 */
function limpiarFiltros() {
    document.getElementById("filtroDia").value = "";
    document.getElementById("filtroEstado").value = "";
    document.getElementById("filtroTexto").value = "";
    renderHistorial();
}

/**
 * Llama a la API para cambiar el estado de un pedido individual
 */
async function cambiarEstadoPedido(pedidoId) {
    const selectEl = document.getElementById(`estado-${pedidoId}`);
    const nuevoEstado = selectEl.value;
    const msgEl = document.getElementById("historialMessage");
    
    // El body debe coincidir con el Map<String, String> que espera el backend
    // { "estado": "NUEVO_ESTADO" }
    const body = { estado: nuevoEstado };

    // Deshabilitar el botón mientras se envía
    const button = selectEl.nextElementSibling; // El botón "Cambiar"
    button.disabled = true;
    button.textContent = "Cambiando...";
    showMessage("historialMessage", "", true); // Limpiar mensajes

    try {
        console.log(` [Admin] Cambiando estado pedido ID ${pedidoId} a ${nuevoEstado}`);
        // Llama a PUT /api/admin/pedidos/{id}/estado
        await apiClient.put(`/admin/pedidos/${pedidoId}/estado`, body);

        console.log(" [Admin] Estado cambiado.");
        showMessage("historialMessage", `Pedido #${pedidoId} actualizado a ${nuevoEstado}.`, false);
        
        // Actualizar la lista localmente (para no recargar todo)
        const index = window.adminHistorialData.findIndex(p => p.id === pedidoId);
        if (index !== -1) {
            window.adminHistorialData[index].estado = nuevoEstado;
        }
        // (Volvemos a renderizar para que los filtros se mantengan)
        renderHistorial();

    } catch (error) {
        console.error(" Error cambiando estado:", error);
        showMessage("historialMessage", "Error: " + error.message, true);
        // Re-habilitar el botón si falla
        button.disabled = false;
        button.textContent = "Cambiar";
    }
}


// ============================
// Inicialización
// ============================
document.addEventListener("DOMContentLoaded", async () => {
    // Cargar los datos al iniciar
    await cargarHistorialAdmin();

    // Eventos de botones de filtro
    const btnFiltrar = document.getElementById("btnFiltrar");
    const btnLimpiar = document.getElementById("btnLimpiar");

    btnFiltrar?.addEventListener("click", renderHistorial);
    btnLimpiar?.addEventListener("click", limpiarFiltros);
});