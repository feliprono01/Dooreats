
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
 * Carga los pedidos actuales (PENDIENTE o EN_PREPARACION) desde la API.
 */
async function cargarPedidoActual() {
  const resumenDiv = document.getElementById("pedidoResumen");
  if (!resumenDiv) return;

  resumenDiv.innerHTML = "<p>Buscando tu pedido actual...</p>";

  try {
    // 1. Llamar a la API
    console.log(" Buscando pedidos actuales...");
    
    // Se quitó /api de la llamada.
    const pedidosActuales = await apiClient.get('/empleado/pedidos/actual');
    
    console.log(" Pedidos actuales recibidos:", pedidosActuales);

    // 2. Validar si hay pedidos
    if (!pedidosActuales || pedidosActuales.length === 0) {
      resumenDiv.innerHTML = `
        <p class="message">No tenés pedidos en proceso.</p>
        <p class.message">Si acabás de pedir, esperá unos segundos. Si tu pedido no aparece, es posible que ya haya sido marcado como 'ENTREGADO'.</p>
        <p><a href="historial.html">Ver historial completo</a></p>
      `;
      return;
    }

    resumenDiv.innerHTML = ""; // Limpiar "Buscando..."

    // 3. Renderizar los pedidos
    pedidosActuales.forEach(pedido => {
      const card = document.createElement("div");
      card.classList.add("pedido-card");

      const itemsHtml = pedido.items.map(item => {
        const obsHtml = item.observaciones
          ? ` <em style="color:#666">(${item.observaciones})</em>`
          : "";
        return `<li><strong>${item.dia}:</strong> ${item.plato}${obsHtml}</li>`;
      }).join("");

      // Renderizar la card con los datos de la API
      card.innerHTML = `
        <h3>Pedido #${pedido.id}</h3>
        <p><strong>Fecha:</strong> ${formatearFecha(pedido.fechaCreacion)}</p>
        <p class="estado"><strong>Estado:</strong> ${pedido.estado}</p>
        <ul>${itemsHtml}</ul>
      `;
      
      resumenDiv.appendChild(card);
    });

  } catch (error) {
    console.error(" Error cargando el pedido actual:", error);
    resumenDiv.innerHTML = `<p class="message" style="color:red;">Error al cargar tu pedido: ${error.message}</p>`;
  }
}