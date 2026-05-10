// ==========================================
// SCRIPT DE SEGURIDAD Y CONTROL DE ACCESO
// ==========================================

// 1. Lógica para verificar quién es el usuario
function obtenerRolUsuario() {
    return localStorage.getItem('rol_usuario') || 'PUBLICO'; 
}

function verificarAcceso() {
    // Si la página no tiene restricciones, pasa directo
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

    // Nivel 2: Entran los Socios y también los Fundadores
    if (CONFIG_ACCESO.SOCIO === true) {
        return rol === 'SOCIO' || rol === 'SOCIO FUNDADOR';
    }

    return false;
}

// 2. Función para dibujar el Pop-Up hermoso (Inyección dinámica)
function mostrarPopUpSeguridad() {
    // Usamos los colores exactos de Ludosofía
    const modalHtml = `
    <div id="security-modal" style="position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem;">
        <!-- Fondo oscuro -->
        <div style="position: absolute; inset: 0; background-color: rgba(42, 42, 42, 0.9); backdrop-filter: blur(4px);"></div>
        
        <!-- Caja del Pop-Up -->
        <div style="position: relative; background-color: #FDF8ED; border: 3px solid #2A2A2A; padding: 2.5rem; max-width: 28rem; width: 100%; box-shadow: 12px 12px 0px #D1623A; text-align: center; animation: modalFadeIn 0.3s ease-out forwards;">
            
            <svg viewBox="0 0 50 50" style="width: 4rem; height: 4rem; margin: 0 auto 1rem auto; color: #2A2A2A;">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="3"/>
                <line x1="15" y1="15" x2="35" y2="35" stroke="currentColor" stroke-width="3"/>
                <line x1="35" y1="15" x2="15" y2="35" stroke="currentColor" stroke-width="3"/>
            </svg>
            
            <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 2.25rem; font-weight: 900; color: #2A2A2A; text-transform: uppercase; letter-spacing: -0.025em; margin-bottom: 0.5rem; line-height: 1;">
                Acceso Restringido
            </h3>
            
            <p style="font-family: 'Outfit', sans-serif; font-size: 1rem; color: #4B5563; margin-bottom: 2rem;">
                Las puertas de este espacio están cerradas. Necesitas iniciar sesión o adquirir una membresía superior para entrar.
            </p>
            
            <button onclick="window.location.href='index.html'" style="width: 100%; background-color: #EBB134; border: 3px solid #2A2A2A; padding: 0.75rem; font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 1.125rem; text-transform: uppercase; letter-spacing: 0.1em; color: #2A2A2A; box-shadow: 4px 4px 0px #2A2A2A; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='6px 6px 0px #2A2A2A';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='4px 4px 0px #2A2A2A';">
                Volver al Inicio a Ingresar
            </button>
        </div>
    </div>
    <style>
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
    `;

    // Insertamos el modal al final de la página
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// 3. Ejecución principal
document.addEventListener('DOMContentLoaded', () => {
    const tienePermiso = verificarAcceso();

    if (!tienePermiso) {
        // Bloqueamos que se pueda hacer scroll
        document.body.style.overflow = 'hidden'; 
        
        // Magia extra: Ocultamos todo el contenido secreto que estaba en la página
        Array.from(document.body.children).forEach(child => {
            if (child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
                child.style.display = 'none';
            }
        });
        
        // Mostramos nuestro nuevo y hermoso pop-up
        mostrarPopUpSeguridad();
    }
});
