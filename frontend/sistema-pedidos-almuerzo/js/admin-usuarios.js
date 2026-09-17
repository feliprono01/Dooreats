
// Variable global para guardar los usuarios de la API
window.adminUsuariosData = [];

// ===================================
// Cargar Usuarios desde la API
// ===================================
async function cargarUsuariosAPI() {
    const tbody = document.getElementById("usuariosTbody");
    const msgEl = document.getElementById("usuariosMessage");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:15px;">Cargando usuarios...</td></tr>`;
    showMessage("usuariosMessage", "", true); // Limpiar mensaje

    try {
        console.log(" [Admin] Cargando usuarios...");
        const usuarios = await apiClient.get('/admin/usuarios');
        console.log(" [Admin] Usuarios recibidos:", usuarios);

        window.adminUsuariosData = usuarios; // Guardar en variable global
        renderUsuarios(); // Renderizar la lista filtrada

    } catch (error) {
        console.error(" Error cargando usuarios:", error);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:15px;">Error al cargar usuarios.</td></tr>`;
        showMessage("usuariosMessage", "Error al cargar: " + error.message, true);
    }
}

// ===================================
// Renderizar listado (con filtros)
// ===================================
function renderUsuarios() {
    const tbody = document.getElementById("usuariosTbody");
    const filtroRol = document.getElementById("filtroRol")?.value || "";
    const buscarTexto = (document.getElementById("buscarTexto")?.value || "").toLowerCase().trim();

    if (!tbody) return;
    tbody.innerHTML = "";

    let usuariosFiltrados = [...window.adminUsuariosData]; 

    // 1. Filtro por rol
    if (filtroRol) {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.role === filtroRol);
    }
    
    // 2. Búsqueda por nombre/email
    if (buscarTexto) {
        usuariosFiltrados = usuariosFiltrados.filter(u =>
            (u.nombreCompleto || "").toLowerCase().includes(buscarTexto) ||
            (u.email || "").toLowerCase().includes(buscarTexto)
        );
    }

    if (usuariosFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:15px;">No hay usuarios para mostrar con los filtros actuales.</td></tr>`;
        return;
    }

    usuariosFiltrados.forEach((u) => {
        const tr = document.createElement("tr");

        // "Traducimos" el rol a un texto amigable
        let displayRole = u.role;
        if (u.role === 'ROLE_ADMIN') {
            displayRole = 'Admin';
        } else if (u.role === 'ROLE_EMPLEADO') {
            displayRole = 'Empleado';
        }


        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.nombreCompleto || "-"}</td>
            <td>${u.email || "-"}</td>
            <td>${displayRole}</td> <td>${u.area || "-"}</td>
            <td>${u.oficina || "-"}</td>
            <td style="text-align:center;">
                <a class="btn-small btn-outline" href="admin-usuario-nuevo.html?id=${u.id}">Editar</a>
                <button class="btn-small btn-danger" onclick="eliminarUsuario(${u.id})">Borrar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ===================================
// Eliminar Usuario (vía API)
// ===================================
async function eliminarUsuario(id) {
    if (!confirm(`¿Seguro que querés eliminar al usuario ID ${id}? Esta acción no se puede deshacer.`)) return;

    const msgEl = document.getElementById("usuariosMessage");
    showMessage("usuariosMessage", `Eliminando usuario ID ${id}...`, false);

    try {
        console.log(`[Admin] Eliminando usuario ID: ${id}`);
        await apiClient.delete(`/admin/usuarios/${id}`, {}); 
        
        console.log(" [Admin] Usuario eliminado.");
        showMessage("usuariosMessage", "Usuario eliminado correctamente.", false);

        // Recargar la lista desde la API
        cargarUsuariosAPI();

    } catch (error) {
        console.error(" Error eliminando usuario:", error);
        showMessage("usuariosMessage", "Error: " + error.message, true);
    }
}

// ===================================
// Eventos
// ===================================
document.addEventListener("DOMContentLoaded", () => {
    // Cargar la lista al iniciar
    cargarUsuariosAPI();

    // Eventos de filtros
    const btnBuscar = document.getElementById("btnBuscar");
    btnBuscar?.addEventListener("click", renderUsuarios); 

    const filtroRol = document.getElementById("filtroRol");
    filtroRol?.addEventListener("change", renderUsuarios); 
    
    const buscarTexto = document.getElementById("buscarTexto");
    buscarTexto?.addEventListener("keyup", (e) => {
        if (e.key === 'Enter') renderUsuarios();
    });
});