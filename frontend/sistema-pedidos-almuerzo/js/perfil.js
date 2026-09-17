
/**
 * Cargar datos del perfil desde la API
 */
async function cargarPerfil() {
  console.log(" Cargando perfil desde la API...");
  try {
    const user = await apiClient.get('/empleado/perfil');
    console.log(" Perfil recibido:", user);
    
    // El 'user' es el PerfilResponseDto

    // Resumen (Columna izquierda)
    document.getElementById("sumNombre").textContent = user.nombreCompleto || "";
    document.getElementById("sumEmail").textContent = user.email || "";
    document.getElementById("sumRol").textContent = user.role || "empleado";
    // (sumEstado no viene de la API, se queda 'Activo' por defecto)

    // Formulario (Columna derecha)
    document.getElementById("nombre").value = user.nombre || "";
    document.getElementById("apellido").value = user.apellido || "";
    document.getElementById("telefono").value = user.telefono || "";
    document.getElementById("area").value = user.area || "";
    document.getElementById("oficina").value = user.oficina || "";
    
    // --- Campos no soportados por el backend ---
    // (Estos campos seguirán usando localStorage para no perder la data)
    const mockData = JSON.parse(localStorage.getItem("perfilMockData")) || {};
    document.getElementById("dieta").value = mockData.dieta || "";
    document.getElementById("alergias").value = mockData.alergias || "";
    document.getElementById("notifEmail").checked = mockData.notifEmail !== undefined ? mockData.notifEmail : true;
    document.getElementById("notifWhatsapp").checked = mockData.notifWhatsapp || false;
    
    // (Avatar también usa localStorage)
    const avatarPreview = document.getElementById("avatarPreview");
    if (mockData.avatar) avatarPreview.src = mockData.avatar;


  } catch (error) {
    console.error(" Error cargando perfil:", error);
    document.getElementById("perfilMsg").textContent = "Error al cargar el perfil: " + error.message;
  }
}

/**
 * Guardar cambios del perfil en la API
 */
async function guardarPerfil(e) {
  e.preventDefault();
  const msg = document.getElementById("perfilMsg");
  const btn = e.target.querySelector("button[type='submit']");
  
  // 1. Leer datos del formulario que SÍ están en el backend
  const perfilDto = {
    nombre: document.getElementById("nombre").value.trim(),
    apellido: document.getElementById("apellido").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    area: document.getElementById("area").value.trim(),
    oficina: document.getElementById("oficina").value.trim(),
  };
  // (perfilDto coincide con PerfilRequestDto.java)

  btn.disabled = true;
  btn.textContent = "Guardando...";
  msg.textContent = "";

  try {
    // 2. Enviar a la API
    console.log(" Guardando perfil:", perfilDto);
    const userActualizado = await apiClient.put('/empleado/perfil', perfilDto);
    console.log(" Perfil guardado:", userActualizado);

    // 3. Actualizar resumen con la respuesta
    document.getElementById("sumNombre").textContent = userActualizado.nombreCompleto || "";

    // 4. Guardar campos "mock" (dieta, alergias, etc.) en localStorage
    const mockData = {
      dieta: document.getElementById("dieta").value,
      alergias: document.getElementById("alergias").value.trim(),
      notifEmail: document.getElementById("notifEmail").checked,
      notifWhatsapp: document.getElementById("notifWhatsapp").checked,
      // (El avatar se guarda en su propia función)
      avatar: localStorage.getItem("perfilMockData") ? JSON.parse(localStorage.getItem("perfilMockData")).avatar : null
    };
    localStorage.setItem("perfilMockData", JSON.stringify(mockData));


    msg.style.color = "green";
    msg.textContent = "Cambios guardados correctamente.";

  } catch (error) {
    console.error(" Error guardando perfil:", error);
    msg.style.color = "red";
    msg.textContent = "Error: " + error.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "Guardar cambios";
  }
}

/**
 * Cambiar contraseña (conectado a la API)
 */
async function cambiarPassword(e) {
  e.preventDefault();
  const msg = document.getElementById("passMsg");
  const btn = e.target.querySelector("button[type='submit']");

  const passActual = document.getElementById("passActual").value.trim();
  const passNueva = document.getElementById("passNueva").value.trim();
  const passRepite = document.getElementById("passRepite").value.trim();

  // 1. Validaciones de frontend
  if (passNueva.length < 6) {
    msg.style.color = "red";
    msg.textContent = "La nueva contraseña debe tener al menos 6 caracteres.";
    return;
  }
  if (passNueva !== passRepite) {
    msg.style.color = "red";
    msg.textContent = "Las contraseñas no coinciden.";
    return;
  }

  // 2. Preparar DTO
  // (Coincide con UpdatePasswordDto.java)
  const passwordDto = { passActual, passNueva }; 

  btn.disabled = true;
  btn.textContent = "Actualizando...";
  msg.textContent = "";

  try {
    // 3. Enviar a la API
    console.log(" Cambiando contraseña...");
    await apiClient.put('/empleado/perfil/password', passwordDto);
    console.log(" Contraseña actualizada.");

    msg.style.color = "green";
    msg.textContent = "Contraseña actualizada.";
    document.getElementById("passForm").reset(); // Limpiar el formulario

  } catch (error) {
    console.error(" Error cambiando contraseña:", error);
    msg.style.color = "red";
    // (El backend devuelve mensajes de error claros, ej: "La contraseña actual no es correcta.")
    msg.textContent = "Error: " + error.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "Actualizar contraseña";
  }
}

// --- FUNCIONES MOCK (Avatar) ---

// Convertir imagen a Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Cambiar avatar (guarda en localStorage)
async function onAvatarChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const b64 = await fileToBase64(file);

  const mockData = JSON.parse(localStorage.getItem("perfilMockData")) || {};
  mockData.avatar = b64;
  localStorage.setItem("perfilMockData", JSON.stringify(mockData));

  const avatarPreview = document.getElementById("avatarPreview");
  avatarPreview.src = b64;
}

// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
  // 1. Cargar datos del perfil (API + mock)
  cargarPerfil();

  // 2. Asignar eventos a los formularios
  const perfilForm = document.getElementById("perfilForm");
  perfilForm?.addEventListener("submit", guardarPerfil);

  const passForm = document.getElementById("passForm");
  passForm?.addEventListener("submit", cambiarPassword);

  const avatarInput = document.getElementById("avatarInput");
  avatarInput?.addEventListener("change", onAvatarChange);
});