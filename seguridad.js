/**
 * LUDOSOFÍA - Módulo de Seguridad y Control de Acceso
 * Archivo: seguridad.js
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Simulación de la Sesión del Usuario
    // Cambia este valor a: 'publico', 'socio' o 'fundador' para probar.
    // Al dejarlo en 'publico', activará el bloqueo en páginas exclusivas (ej. CONFIG_ACCESO.PUBLICO = false).
    const nivelUsuarioActual = 'publico'; 

    // 2. Verificar el objeto de configuración (definido en el HTML de cada página)
    if (typeof CONFIG_ACCESO === 'undefined') {
        console.warn("Advertencia: No se encontró CONFIG_ACCESO en esta página. Permitiendo acceso por defecto.");
        return;
    }

    // 3. Lógica de validación de permisos
    let accesoPermitido = false;

    if (nivelUsuarioActual === 'publico' && CONFIG_ACCESO.PUBLICO) {
        accesoPermitido = true;
    } else if (nivelUsuarioActual === 'socio' && (CONFIG_ACCESO.SOCIO || CONFIG_ACCESO.PUBLICO)) {
        accesoPermitido = true;
    } else if (nivelUsuarioActual === 'fundador' && (CONFIG_ACCESO.FUNDADOR || CONFIG_ACCESO.SOCIO || CONFIG_ACCESO.PUBLICO)) {
        accesoPermitido = true;
    }

    // 4. Ejecutar Bloqueo si no hay permiso y redirigir a Suscripción
    if (!accesoPermitido) {
        // Ocultar el contenido inmediatamente para que no lo puedan leer de fondo
        document.body.style.display = 'none';
        
        // Redirigir a la página de planes para convertirlos en socios
        alert("El Oráculo exige un tributo. Este contenido es exclusivo para Socios del club.");
        window.location.href = "suscripcion.html"; 
    }
});
