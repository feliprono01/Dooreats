/* ============================
   UTILIDADES GLOBALES
============================*/
/*
// 🔹 Cambiar a false en producción
const MODO_DESARROLLO = true;

/**
 * Obtener el usuario actual desde localStorage
 * @returns {Object|null} usuario { email, rol } o null si no hay sesión
 
function getUsuarioActual() {
  return JSON.parse(localStorage.getItem("usuario"));
}

/**
 * Verifica si hay usuario logueado
 * Si no hay, redirige al login (o crea demo si está en modo desarrollo)
 * @param {string|null} rol Rol requerido ("empleado" | "admin"), opcional
 
function requireLogin(rol = null) {
  let usuario = getUsuarioActual();

  if (!usuario) {
    if (MODO_DESARROLLO) {
      console.warn("⚠️ Modo desarrollo: usuario demo cargado automáticamente.");
      // 🔹 Usuario demo por defecto: empleado
      usuario = { email: "demo@empresa.com", rol: "empleado" };
      localStorage.setItem("usuario", JSON.stringify(usuario));
    } else {
      alert("Debes iniciar sesión primero.");
      window.location.href = "index.html";
      return;
    }
  }

  if (rol && usuario.rol !== rol) {
    alert("No tienes permisos para acceder a esta página.");
    // 🔹 Si es admin lo mandamos a admin-panel, si es empleado al menú
    if (usuario.rol === "admin") {
      window.location.href = "admin-panel.html";
    } else {
      window.location.href = "menu.html";
    }
  }
}

/**
 * Cerrar sesión
 
function logout() {
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
}

/**
 * Mostrar el nombre o email del usuario logueado
 * Ideal para header/navbar
 
function mostrarUsuarioEnHeader(idElemento) {
  const usuario = getUsuarioActual();
  if (usuario && document.getElementById(idElemento)) {
    document.getElementById(idElemento).textContent =
      usuario.email + " (" + usuario.rol + ")";
  }
}
*/
