
// ============================
// Cargar menú en Admin desde la API
// ============================
async function cargarMenuAdmin() {
  const container = document.getElementById("menuAdminContainer");
  const msgEl = document.getElementById("menuAdminMessage");
  if (!container) return;

  container.innerHTML = "<p>Cargando menú...</p>";
  
  try {
    console.log(" [Admin] Cargando menú...");
    // Llama a GET 
    const menu = await apiClient.get('/admin/menu');
    console.log(" [Admin] Menú recibido:", menu);
    
    // Guardamos el menú globalmente para re-renderizar rápido
    window.menuAdminData = menu;
    
    renderMenuAdmin();
    
  } catch (error) {
    console.error("Error cargando menú:", error);
    if (msgEl) showMessage("menuAdminMessage", "Error al cargar el menú: " + error.message, true);
  }
}

// ============================
// Renderizar Menú (desde datos en memoria)
// ============================
function renderMenuAdmin() {
  const container = document.getElementById("menuAdminContainer");
  const menu = window.menuAdminData || [];
  container.innerHTML = "";

  if (menu.length === 0) {
    container.innerHTML = "<p>No hay días de menú cargados.</p>";
    return;
  }

  // (El backend ya lo devuelve ordenado por día)
  menu.forEach((diaMenu) => {
    const card = document.createElement("div");
    card.classList.add("menu-admin-card");

    let html = `<h3>${diaMenu.dia}</h3><ul>`;
    
    // diaMenu.platos es un List<String>
    diaMenu.platos.forEach((plato) => {
      html += `
        <li>
          ${plato}
          <button class="btn-delete" onclick="eliminarPlato('${diaMenu.dia}', '${plato}')">X</button>
        </li>`;
    });
    html += "</ul>";

    card.innerHTML = html;
    container.appendChild(card);
  });
}

// ============================
// Agregar Plato (vía API)
// ============================
const formPlato = document.getElementById("formPlato");
if (formPlato) {
  formPlato.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const diaSelect = document.getElementById("dia");
    const platoInput = document.getElementById("plato");
    const msgEl = document.getElementById("menuAdminMessage");
    const btn = e.target.querySelector("button[type='submit']");

    const dia = diaSelect.value;
    const plato = platoInput.value.trim();

    if (!dia || !plato) {
      showMessage("menuAdminMessage", "Debes seleccionar un día y un plato.", true);
      return;
    }
    
    // Body para POST 
    const body = { dia, plato };

    btn.disabled = true;
    btn.textContent = "Agregando...";
    showMessage("menuAdminMessage", "", true); // Limpiar mensaje

    try {
      console.log(" [Admin] Agregando plato:", body);
      // menuActualizado es el MenuDto del día
      const menuActualizado = await apiClient.post('/admin/menu/agregar', body);
      console.log(" [Admin] Plato agregado:", menuActualizado);

      // Refrescar la vista
      cargarMenuAdmin(); 
      e.target.reset(); // Limpiar formulario
      showMessage("menuAdminMessage", `Plato "${plato}" agregado al ${dia}.`, false);

    } catch (error) {
      console.error("Error agregando plato:", error);
      showMessage("menuAdminMessage", "Error: " + error.message, true);
    } finally {
      btn.disabled = false;
      btn.textContent = "Agregar Plato";
    }
  });
}

// ============================
// Eliminar Plato (vía API)
// ============================
async function eliminarPlato(dia, plato) {
  if (!confirm(`¿Seguro que querés eliminar "${plato}" del día ${dia}?`)) {
    return;
  }
  
  const msgEl = document.getElementById("menuAdminMessage");
  
  // Body para DELETE /api/admin/menu/eliminar
  const body = { dia, plato };

  showMessage("menuAdminMessage", `Eliminando "${plato}"...`, false);

  try {
    console.log(" [Admin] Eliminando plato:", body);
    // Usamos el nuevo método .delete de nuestro apiClient
    const menuActualizado = await apiClient.delete('/admin/menu/eliminar', body);
    console.log(" [Admin] Plato eliminado:", menuActualizado);

    // Refrescar la vista
    cargarMenuAdmin();
    showMessage("menuAdminMessage", `Plato "${plato}" eliminado.`, false);

  } catch (error) {
    console.error("Error eliminando plato:", error);
    showMessage("menuAdminMessage", "Error: " + error.message, true);
  }
}