// ==========================================
// SCRIPT DE SEGURIDAD Y CONTROL DE ACCESO
// ==========================================

function obtenerRolUsuario() {
    return localStorage.getItem('rol_usuario') || 'PUBLICO'; 
}

function verificarAcceso() {
    // Si la constante CONFIG_ACCESO no está definida, es de navegación libre
    if (typeof CONFIG_ACCESO === 'undefined') {
        return true;
    }

    const rol = obtenerRolUsuario();

    // Nivel 1: Entran todos
    if (CONFIG_ACCESO.PUBLICO === true) {
        return true;
    }

    // Nivel 3: SOLO entran los Socios Fundadores
    if (CONFIG_ACCESO.SOCIO_FUNDADOR === true) {
        return rol === 'SOCIO FUNDADOR';
    }

    // Nivel 2: Entran los Socios y también los Socios Fundadores
    if (CONFIG_ACCESO.SOCIO === true) {
        return rol === 'SOCIO' || rol === 'SOCIO FUNDADOR';
    }

    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    const tienePermiso = verificarAcceso();

    if (!tienePermiso) {
        alert('El Ágora está restringida. Necesitas un nivel de membresía superior para ver este contenido.');
        window.location.href = 'index.html'; 
    }
});
