
// ============================
// Cargar menú DESDE LA API
// ============================
async function cargarMenu() {
  const container = document.getElementById("menuContainer");
  if (!container) return; 

  const messageEl = document.getElementById("menuMessage");
  const btnGuardar = document.getElementById("guardarPedido");
  
  try {
    console.log(' Obteniendo asistencia desde API...');
    const asistencia = await apiClient.get('/empleado/asistencia'); 
    console.log(' Asistencia recibida:', asistencia);

    console.log(' Obteniendo menú desde API...');
    const menu = await apiClient.get('/empleado/menu');
    console.log(' Menú recibido:', menu);

    container.innerHTML = ""; 

    if (!asistencia || asistencia.length === 0) {
      container.innerHTML = `<p class="message"> No configuraste tu asistencia. 
        <a href="asistencia.html">Hazlo aquí</a> para poder pedir tu menú.</p>`;
      btnGuardar.disabled = true;
      return;
    }

    const menuFiltrado = menu.filter(diaMenu => asistencia.includes(diaMenu.dia));
    
    if (menuFiltrado.length === 0) {
      container.innerHTML = `<p class="message"> Configuraste tu asistencia, pero no hay menú cargado para esos días.</p>`;
      btnGuardar.disabled = true;
      return;
    }

    menuFiltrado.forEach((diaMenu) => {
      const div = document.createElement("div");
      div.classList.add("menu-dia");
      let html = `<h3>${diaMenu.dia}</h3><div class="platos">`;
      diaMenu.platos.forEach((plato, index) => {
        const id = `plato-${diaMenu.dia}-${index}`;
        html += `
          <input type="radio" id="${id}" name="plato-${diaMenu.dia}" value="${plato}">
          <label for="${id}">${plato}</label>
        `;
      });
      html += `</div>
        <div class="obs-wrap">
          <label for="obs-${diaMenu.dia}" class="obs-label">Observaciones (opcional)</label>
          <textarea id="obs-${diaMenu.dia}" class="obs-text" placeholder="Ej: sin sal, cambiar guarnición…" rows="2" disabled></textarea>
        </div>`;
      div.innerHTML = html;
      container.appendChild(div);
      const radios = div.querySelectorAll(`input[name="plato-${diaMenu.dia}"]`);
      const obs = div.querySelector(`#obs-${diaMenu.dia}`);
      radios.forEach((radio) => {
        radio.addEventListener("change", () => {
          obs.disabled = false;
          obs.placeholder = `Observaciones para ${diaMenu.dia} — ${radio.value}`;
        });
      });
    });

  } catch (error) {
    console.error("Error cargando menú desde la API:", error);
    const messageEl = document.getElementById("menuMessage");
    if (messageEl) {
      messageEl.style.color = "red";
      messageEl.textContent = "Error al cargar el menú: " + error.message;
    }
  }
}

// ============================
// Guardar pedido EN LA API
// ============================
async function guardarPedido() {
  const message = document.getElementById("menuMessage");
  const button = document.getElementById("guardarPedido");

  const platosMap = {};
  document.querySelectorAll(".menu-dia").forEach((diaDiv) => {
    const dia = diaDiv.querySelector("h3").textContent.toUpperCase();
    const seleccionado = diaDiv.querySelector("input[type='radio']:checked");
    if (seleccionado) {
      const obs = (diaDiv.querySelector(".obs-text")?.value || "").trim();
      platosMap[dia] = {
        plato: seleccionado.value,
        observaciones: obs
      };
    }
  });

  if (Object.keys(platosMap).length === 0) {
    message.style.color = "red";
    message.textContent = "Debes seleccionar al menos un plato.";
    return;
  }

  const pedidoRequestDto = { platos: platosMap };
  button.disabled = true;
  button.textContent = "Guardando...";

  try {
    console.log(' Guardando pedido en API:', pedidoRequestDto);
    const pedidosGuardados = await apiClient.post('/empleado/pedidos', pedidoRequestDto);
    console.log(' Pedido guardado:', pedidosGuardados);
    message.style.color = "green";
    message.textContent = "Pedido guardado correctamente.";
    
    setTimeout(() => {
        window.location.href = "pedido.html"; 
    }, 1500);

  } catch (error) {
    console.error("Error guardando pedido:", error);
    message.style.color = "red";
    message.textContent = "Error al guardar el pedido: " + (error.message || "Error desconocido");
    button.disabled = false;
    button.textContent = "Guardar Pedido";
  }
}

// ============================
// Inicialización
// ============================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof apiClient === 'undefined') {
    console.error("Error: auth.js (apiClient) no se cargó antes de pedidos.js");
    return;
  }
  
  const btnGuardar = document.getElementById("guardarPedido");
  if (btnGuardar) {
    btnGuardar.addEventListener("click", guardarPedido);
  }
  
  if (document.getElementById("menuContainer")) {
    cargarMenu();
  }
  
  if (document.getElementById("historialContainer") && !window.location.pathname.endsWith('historial.html')) {
     listarHistorial();
  }
});


// ===================================================================
//  SECCIÓN: HISTORIAL Y REPETIR PEDIDO (Conectado a la API)
// ===================================================================

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
 * Obtiene el historial de pedidos desde la API y lo renderiza.
 */
async function listarHistorial() {
  const container = document.getElementById("historialContainer");
  const messageEl = document.getElementById("historialMessage");
  
  if (!container || !messageEl) {
    console.log("No se encontró #historialContainer, saltando listarHistorial()");
    return;
  }

  console.log(" Cargando historial desde API...");
  container.innerHTML = "<p>Cargando historial...</p>";

  try {
    const pedidos = await apiClient.get('/empleado/historial');
    console.log(" Historial recibido:", pedidos);

    if (!pedidos || pedidos.length === 0) {
      container.innerHTML = "<p>No hay pedidos registrados en el historial.</p>";
      return;
    }

    container.innerHTML = ""; 

    pedidos.forEach((pedido) => {
      const card = document.createElement("div");
      card.classList.add("pedido-card"); 

      const items = pedido.items.map(item => {
          const obsHTML = item.observaciones
            ? ` <em style="color:#666">(${item.observaciones})</em>`
            : "";
          return `<li><strong>${item.dia}:</strong> ${item.plato}${obsHTML}</li>`;
        })
        .join("");

      card.innerHTML = `
        <h3>Pedido #${pedido.id}</h3>
        <p><strong>Fecha:</strong> ${formatearFecha(pedido.fechaCreacion)}</p>
        <p><strong>Estado:</strong> ${pedido.estado}</p>
        <ul>${items}</ul>
        <button class="btn-repetir" onclick="repetirPedido(${pedido.id}, this)">
          Repetir Pedido
        </button>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error(" Error cargando historial:", error);
    messageEl.textContent = "Error al cargar el historial: " + error.message;
  }
}

/**
 * Llama a la API para repetir un pedido existente por su ID.
 */
async function repetirPedido(pedidoId, buttonElement) {
  if (buttonElement) {
    buttonElement.disabled = true;
    buttonElement.textContent = "Repitiendo...";
  }

  const messageEl = document.getElementById("historialMessage");
  messageEl.textContent = "";

  console.log(` Repitiendo pedido ID: ${pedidoId}`);

  try {
    const pedidoRepetido = await apiClient.post(`/empleado/pedidos/repetir/${pedidoId}`);
    
    console.log(" Pedido repetido:", pedidoRepetido);
    
    alert(`Pedido #${pedidoId} repetido con éxito. El nuevo pedido es #${pedidoRepetido.id}.`);
    window.location.reload(); 

  } catch (error) {
    console.error(" Error al repetir pedido:", error);
    messageEl.textContent = "Error al repetir el pedido: " + error.message;
    if (buttonElement) {
      buttonElement.disabled = false;
      buttonElement.textContent = "Repetir Pedido";
    }
  }
}