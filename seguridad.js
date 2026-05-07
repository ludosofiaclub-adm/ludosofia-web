// ==========================================
// SCRIPT DE SEGURIDAD Y CONTROL DE ACCESO
// ==========================================

// 1. Obtener el rol del usuario (guardado por el modal de login)
function obtenerRolUsuario() {
    // Si no hay nadie logueado o es alguien nuevo, por defecto es 'PUBLICO'
    return localStorage.getItem('rol_usuario') || 'PUBLICO'; 
}

// 2. Función principal de verificación de permisos
function verificarAcceso() {
    
    // MODO DESARROLLO: Si en algún momento necesita diseñar sin que la pantalla 
    // lo bloquee, simplemente quite las dos barras (//) de la línea de abajo:
    // return true; 
    
    // Si la constante CONFIG_ACCESO no está definida en la página actual, es de navegación libre
    if (typeof CONFIG_ACCESO === 'undefined') {
        return true;
    }

    const rol = obtenerRolUsuario();

    // Si la página es para todo PÚBLICO, entran todos
    if (CONFIG_ACCESO.PUBLICO === true) {
        return true;
    }

    // Si la página es nivel FUNDADOR, SOLO entran los Fundadores
    if (CONFIG_ACCESO.FUNDADOR === true) {
        return rol === 'FUNDADOR';
    }

    // Si la página es nivel SOCIO, entran los Socios y también los Fundadores
    if (CONFIG_ACCESO.SOCIO === true) {
        return rol === 'SOCIO' || rol === 'FUNDADOR';
    }

    // Si no cumple ninguna condición, se le deniega el acceso
    return false;
}

// 3. Ejecutar la validación apenas cargue el documento HTML
document.addEventListener('DOMContentLoaded', () => {
    const tienePermiso = verificarAcceso();

    if (!tienePermiso) {
        // Acciones si no tiene acceso
        alert('El Ágora está restringida. Necesitas un nivel de membresía superior para ver este contenido.');
        
        // Lo devolvemos a la página principal
        window.location.href = 'index.html'; 
    }
});
