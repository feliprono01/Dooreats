
/**
 * Helper para obtener parámetros de la URL
 */
function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// Variable para saber si estamos editando o creando
let modo = "crear";
let usuarioId = null;

/**
 * Cargar datos del usuario si estamos en modo "Editar"
 */
async function cargarDatosParaEditar() {
  usuarioId = getParam("id");
  if (!usuarioId) {
    modo = "crear";
    document.getElementById("formTitulo").textContent = "Alta de Usuario";
    document.getElementById("passwordBlock").style.display = "block";
    return;
  }

  // Si hay ID, estamos editando
  modo = "editar";
  document.getElementById("formTitulo").textContent = "Editar Usuario";
  document.getElementById("passwordBlock").style.display = "none"; // No se puede cambiar pass desde aquí
  document.getElementById("email").disabled = true; // No dejamos cambiar el email

  const msg = document.getElementById("formMsg");
  showMessage("formMsg", "Cargando datos del usuario...", false);

  try {
    console.log(` [Admin] Cargando usuario ID: ${usuarioId}`);
    // Llama a GET /api/admin/usuarios/{id}
    // El DTO de respuesta tiene todos los campos
    const user = await apiClient.get(`/admin/usuarios/${usuarioId}`);
    
    // Rellenar el formulario
    document.getElementById("usuarioId").value = user.id;
    document.getElementById("nombre").value = user.nombre || "";
    document.getElementById("apellido").value = user.apellido || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("telefono").value = user.telefono || "";
    document.getElementById("area").value = user.area || "";
    document.getElementById("oficina").value = user.oficina || "";
    document.getElementById("rol").value = user.role || "ROLE_EMPLEADO";
    
    showMessage("formMsg", "", false); // Limpiar "Cargando..."

  } catch (error) {
    console.error(" Error cargando usuario:", error);
    showMessage("formMsg", "Error al cargar el usuario: " + error.message, true);
  }
}

/**
 * Manejar el envío del formulario (Crear o Actualizar)
 */
async function guardarUsuario(e) {
  e.preventDefault();
  const msg = document.getElementById("formMsg");
  const btn = e.target.querySelector("button[type='submit']");

  // 1. Recolectar datos del formulario
  // (El backend espera un Map<String, String>)
  const body = {
    nombre: document.getElementById("nombre").value.trim(),
    apellido: document.getElementById("apellido").value.trim(),
    email: document.getElementById("email").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    area: document.getElementById("area").value.trim(),
    oficina: document.getElementById("oficina").value.trim(),
    rol: document.getElementById("rol").value,
  };

  // 2. Validaciones
  if (!body.nombre || !body.apellido || !body.email) {
    showMessage("formMsg", "Nombre, Apellido y Email son obligatorios.", true);
    return;
  }

  // 3. Agregar contraseña (solo en modo crear)
  if (modo === "crear") {
    const password = document.getElementById("password").value;
    if (!password || password.length < 6) {
      showMessage("formMsg", "La contraseña debe tener al menos 6 caracteres.", true);
      return;
    }
    body.password = password;
  }
  
  btn.disabled = true;
  btn.textContent = "Guardando...";
  showMessage("formMsg", "", true); // Limpiar

  try {
    if (modo === "crear") {
      // 4. API POST (Crear)
      console.log("📤 [Admin] Creando usuario:", body);
      // Llama a POST /api/admin/usuarios
      await apiClient.post('/admin/usuarios', body);
      
    } else {
      // 5. API PUT (Actualizar)
      console.log(` [Admin] Actualizando usuario ID: ${usuarioId}`, body);
      // Llama a PUT /api/admin/usuarios/{id}
      await apiClient.put(`/admin/usuarios/${usuarioId}`, body);
    }
    
    // 6. Éxito
    showMessage("formMsg", "Usuario guardado correctamente. Redirigiendo...", false);
    setTimeout(() => {
      window.location.href = "admin-usuarios.html";
    }, 1500);

  } catch (error) {
    console.error(" Error guardando usuario:", error);
    showMessage("formMsg", "Error: " + error.message, true);
    btn.disabled = false;
    btn.textContent = "Guardar";
  }
}

// ===================================
// Inicialización
// ===================================
document.addEventListener("DOMContentLoaded", () => {
  // Rellenar el formulario si es modo "editar"
  cargarDatosParaEditar();

  // Asignar el evento al formulario
  const form = document.getElementById("usuarioForm");
  form?.addEventListener("submit", guardarUsuario);
});