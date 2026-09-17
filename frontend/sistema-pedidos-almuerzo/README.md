# Proyecto Integrador PP1 - Dooreats [Cuarta Etapa]

Este documento describe la estructura y el despliegue de la Cuarta Etapa del Proyecto Integrador. En esta fase, se finalizó el desarrollo del back-end en Spring Boot y se realizó la integración completa con el front-end.

## Integrantes
* Felipe Prono
* Santiago Fernandez
* Santiago Aylagas
* Santino Bertone

(Curso: 2do. Año - Desarrollo de Software - IES) 

## 1. Dependencias y Versiones

### Backend (Spring Boot)
* **Java:** 17
* **Framework:** Spring Boot [Tu Versión, ej: 3.2.0]
* **Dependencias Clave:**
    * Spring Boot Starter Web [cite: 102]
    * JPA para Persistencia de datos [cite: 102]
    * MySQL como Base de Datos [cite: 102]
    * Spring Boot Starter Security para Seguridad Core [cite: 103]
    * JWT para la creación y gestión de Tokens [cite: 103]
    * Lombok para simplificar entidades (Getters, Setters, etc.) [cite: 104]

### Frontend
* **Stack:** HTML5, CSS3, JavaScript (ES6+)
* **No se utilizan frameworks** (Desarrollo "vanilla").

## 2. Estructura de Carpetas

### Backend (Spring Boot)
El proyecto sigue la arquitectura de tres capas recomendada [cite: 33, 41-48]:

/src/main/java/com/dooreats/dooreatsapi
├── controller   (Controladores REST) [cite: 42, 43]
├── service      (Lógica de negocio) [cite: 44]
├── repository   (Acceso a datos JPA) [cite: 45]
├── model        (Entidades JPA, ex "entity") [cite: 47]
├── dto          (Transferencia de datos) [cite: 46]
├── security     (Configuración de Spring Security, JWT, CORS)
├── exception    (Manejo centralizado de errores) [cite: 48]
└── config       (DataLoader)

### Frontend
/ (Raíz del proyecto)
├── css/
│   └── style.css
├── js/
│   ├── auth.js         (Gestión de API, login, y sesión)
│   ├── pedidos.js      (Lógica de menú y historial de empleado)
│   ├── perfil.js       (Lógica de perfil de empleado)
│   ├── admin-menu.js
│   ├── admin-pedidos.js
│   ├── admin-usuarios.js
│   └── ... (resto de archivos JS)
├── assets/
│   ├── mock/           (Archivos JSON de prueba, ya no se usan)
│   └── logo.png
├── index.html          (Login)
├── menu.html           (Menú de empleado)
├── admin-panel.html    (Panel de admin)
└── ... (resto de archivos HTML)

## 3. Pasos para la Ejecución

Ambos módulos (front y back) se ejecutan por separado.

### Ejecutar el Backend (Spring Boot)

1.  **Base de Datos:** Asegúrate de tener MySQL corriendo (puedes usar XAMPP ). Crea una base de datos vacía (ej: `dooreats_db`).
2.  **Importación SQL (Importante):** No se requiere un archivo `.sql`. El `DataLoader.java` detectará si la base de datos está vacía y la cargará automáticamente con los usuarios, menús y datos de prueba necesarios.
3.  **Configuración:** Revisa `src/main/resources/application.properties` y ajusta la URL de la base de datos (`spring.datasource.url`), el usuario y la contraseña.
4.  **Ejecución:** Abre una terminal en la raíz de la carpeta del backend y ejecuta el comando[cite: 92]:
    ```bash
    mvn spring-boot:run
    ```
5.  El servidor se iniciará en `http://localhost:8080`.

### Ejecutar el Frontend

1.  **Configuración de API:** Abre el archivo `js/auth.js` y asegúrate de que la variable `API_URL` apunte a la IP y puerto correctos de tu backend (ej: `http://192.168.0.38:8080/api`).
2.  **Ejecución:** Usa un servidor local como "Live Server" en Visual Studio Code para abrir el `index.html`[cite: 93].
3.  Abre el navegador en la dirección de tu servidor local (ej: `http://127.0.0.1:5500`) para ver la pantalla de login.

## 4. Observaciones

* **Integración Completa:** El front-end y el back-end están 100% integrados. Todos los *mockups* de `localStorage` y archivos `*.json` han sido reemplazados por llamadas reales a la API.
* **Autenticación:** Se maneja vía tokens JWT. El token se guarda en `localStorage` en el front-end después del login.
* **CORS:** La configuración de CORS en `ApplicationConfig.java` es fundamental y está ajustada para permitir la comunicación desde el front-end local.
* **Campos "Mock" restantes:** El formulario de `perfil.html` tiene campos (dieta, alergias, avatar) que *no* están en el `PerfilRequestDto` del backend. Para no perder la funcionalidad, esos campos específicos siguen guardándose de forma simulada en `localStorage`, mientras que el resto del formulario sí viaja a la API.

## 5. Usuarios de Prueba

El `DataLoader.java` crea los siguientes usuarios al arrancar (si la tabla de usuarios está vacía):

* **Administrador:**
    * **Email:** `admin@empresa.com`
    * **Contraseña:** `admin`
* **Empleado:**
    * **Email:** `test@empresa.com`
    * **Contraseña:** `felipe`