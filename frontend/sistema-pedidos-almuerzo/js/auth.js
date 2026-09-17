
// ============================================
// 1. CONFIGURACIÓN DE LA API
// ============================================

//const API_URL = 'http://192.168.0.38:8080/api';
// js/auth.js
const API_URL = 'http://localhost:8080/api';
console.log(" Conectando a la API en:", API_URL);

// ============================================
// 2. UTILIDADES
// ============================================

function showMessage(elementId, text, isError = true) {
  const messageEl = document.getElementById(elementId);
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.style.color = isError ? 'red' : 'green';
}

// ============================================
// 3. CLIENTE DE API
// ============================================

const apiClient = {
  getToken: () => localStorage.getItem("token"),

  get: async (endpoint) => {
    const token = apiClient.getToken();
    
    console.log(' GET Request:', { url: `${API_URL}${endpoint}`, hasToken: !!token });

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(' GET Response:', { status: response.status, ok: response.ok });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      if (response.status === 204) return null;
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error(' GET Error:', error);
      throw error;
    }
  },

  post: async (endpoint, body) => {
    const token = apiClient.getToken();
    const headers = { 'Content-Type': 'application/json' };
    
    if (!endpoint.startsWith('/auth') && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    console.log(' POST Request:', { url: `${API_URL}${endpoint}`, hasToken: !!headers['Authorization'] });

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });
      console.log(' POST Response:', { status: response.status, ok: response.ok });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error(' POST Error:', error);
      throw error;
    }
  },

  put: async (endpoint, body) => {
    const token = apiClient.getToken();
    console.log(' PUT Request:', { url: `${API_URL}${endpoint}`, hasToken: !!token });
    if (!token) throw new Error("No hay token de autenticación.");

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      console.log(' PUT Response:', { status: response.status, ok: response.ok });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      const text = await response.text();
      return text ? JSON.parse(text) : { success: true };
    } catch (error) {
      console.error(' PUT Error:', error);
      throw error;
    }
  },

  delete: async (endpoint, body) => {
    const token = apiClient.getToken();
    console.log(' DELETE Request:', { url: `${API_URL}${endpoint}`, hasToken: !!token });
    if (!token) throw new Error("No hay token de autenticación.");

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // (El body es necesario para que el backend sepa qué plato borrar)
        body: JSON.stringify(body) 
      });
      console.log(' DELETE Response:', { status: response.status, ok: response.ok });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      // DELETE puede devolver el objeto actualizado o nada
      const text = await response.text(); 
      return text ? JSON.parse(text) : { success: true };
    } catch (error) {
      console.error(' DELETE Error:', error);
      throw error;
    }
  }
};

// ============================================
// 4. GESTIÓN DE SESIÓN
// ============================================

function logout() {
  console.log(' Cerrando sesión');
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
}

function getUsuarioSesion() {
  const userJson = localStorage.getItem("usuario");
  return userJson ? JSON.parse(userJson) : null;
}

function requireLogin(rolRequerido) {
  const usuario = getUsuarioSesion();
  const token = apiClient.getToken();

  if (!usuario || !token) {
    logout();
    return;
  }

  const rolUsuario = usuario.role === 'ROLE_ADMIN' ? 'admin' : 'empleado';
  
  if (rolRequerido === 'admin' && rolUsuario !== 'admin') {
    logout();
    return;
  }
  
  if (rolRequerido === 'empleado' && rolUsuario === 'admin') {
    window.location.href = "admin-panel.html";
    return;
  }
}

function showMessage(elementId, text, isError = true) {
  const messageEl = document.getElementById(elementId);
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.style.color = isError ? 'red' : 'green';
}

function mostrarUsuarioEnHeader(elementId) {
  const headerEl = document.getElementById(elementId);
  const usuario = getUsuarioSesion();
  if (headerEl && usuario) {
    headerEl.textContent = usuario.nombreCompleto || usuario.email;
  }
}

// ============================================
// 5. FORMULARIO DE LOGIN
// ============================================

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const button = loginForm.querySelector("button[type='submit']");
    const messageId = "message";

    if (!email || !password) {
      showMessage(messageId, "Todos los campos son obligatorios.");
      return;
    }
    button.disabled = true;
    button.textContent = "Ingresando...";
    try {
      console.log(' Intentando login');
      const authData = await apiClient.post('/auth/login', { email, password });
      console.log(' Login exitoso');
      localStorage.setItem("token", authData.token);
      localStorage.setItem("usuario", JSON.stringify(authData.user));
      showMessage(messageId, "Ingreso exitoso. Redirigiendo...", false);
      const rol = authData.user.role;
      setTimeout(() => {
        window.location.href = (rol === 'ROLE_ADMIN') ? "admin-panel.html" : "menu.html";
      }, 1200);
    } catch (error) {
      console.error(' Error en login:', error);
      showMessage(messageId, error.message);
      button.disabled = false;
      button.textContent = "Ingresar";
    }
  });
}

// ============================================
// 6. FORMULARIO DE REGISTRO
// ============================================

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const button = registerForm.querySelector("button[type='submit']");
    const messageId = "regMessage";

    if (!nombre || !apellido || !email || !password || !confirmPassword) {
      showMessage(messageId, "Todos los campos son obligatorios.");
      return;
    }
    if (password.length < 6) {
      showMessage(messageId, "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      showMessage(messageId, "Las contraseñas no coinciden.");
      return;
    }
    button.disabled = true;
    button.textContent = "Creando cuenta...";
    try {
      const registerRequest = { nombre, apellido, email, password };
      await apiClient.post('/auth/register', registerRequest);
      showMessage(messageId, "Registro exitoso. Redirigiendo...", false);
      setTimeout(() => (window.location.href = "index.html"), 2000);
    } catch (error) {
      showMessage(messageId, error.message);
      button.disabled = false;
      button.textContent = "Crear cuenta";
    }
  });
}

// ============================================
// 7. FORMULARIO DE ASISTENCIA
// ============================================

const asistenciaForm = document.getElementById("asistenciaForm");
if (asistenciaForm) {
  (async () => {
    try {
      console.log(' Cargando asistencia...');
      const diasGuardados = await apiClient.get('/empleado/asistencia');
      console.log(' Asistencia recibida:', diasGuardados);
      if (diasGuardados && diasGuardados.length > 0) {
        document.querySelectorAll("input[name='dias']").forEach((chk) => {
          if (diasGuardados.includes(chk.value)) {
            chk.checked = true;
          }
        });
      }
    } catch (error) {
      console.error(' Error cargando asistencia:', error);
      showMessage("asisMessage", "Error al cargar asistencia: " + error.message);
    }
  })();
  asistenciaForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const seleccionados = Array.from(
      document.querySelectorAll("input[name='dias']:checked")
    ).map((chk) => chk.value);
    const messageId = "asisMessage";
    const button = asistenciaForm.querySelector("button[type='submit']");
    if (seleccionados.length === 0) {
      showMessage(messageId, "Debes seleccionar al menos un día.");
      return;
    }
    button.disabled = true;
    button.textContent = "Guardando...";
    try {
      console.log(' Guardando asistencia:', seleccionados);
      const asistenciaDto = { dias: seleccionados };
      await apiClient.put('/empleado/asistencia', asistenciaDto);
      console.log(' Asistencia guardada');
      showMessage(messageId, "Asistencia guardada correctamente.", false);
      setTimeout(() => (window.location.href = "menu.html"), 1500);
    } catch (error) {
      console.error(' Error guardando:', error);
      showMessage(messageId, "Error: " + error.message);
      button.disabled = false;
      button.textContent = "Guardar asistencia";
    }
  });
}

// ============================================
// 8. FORGOT PASSWORD (Demo)
// ============================================
const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // ... (lógica demo)
  });
}

// ============================================
// 9. RESET PASSWORD (Demo)
// ============================================
const resetForm = document.getElementById("resetForm");
if (resetForm) {
  resetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // ... (lógica demo)
  });
}