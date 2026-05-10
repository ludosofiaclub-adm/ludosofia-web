/**
 * LUDOSOFÍA - Módulo de Seguridad y Control de Acceso
 * Archivo: seguridad.js
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. LEER LA SESIÓN REAL DEL NAVEGADOR
    // Firebase en tu index.html guarda el rol en 'rol_usuario'
    let rolGuardado = localStorage.getItem('rol_usuario');
    
    // Si no hay nada guardado, es público. Si hay algo, lo pasamos a minúsculas para comparar.
    const nivelUsuarioActual = rolGuardado ? rolGuardado.toLowerCase() : 'publico'; 

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

    // 4. Pop-up Gamificado si no hay permiso
    if (!accesoPermitido) {
        
        // Ocultar el contenido, PERO proteger los modales de sesión para que sigan funcionando
        Array.from(document.body.children).forEach(child => {
            if (child.tagName !== 'SCRIPT' && !child.id?.includes('modal') && child.id !== 'mobile-menu') {
                child.style.display = 'none';
            }
        });

        // Crear el Pop-up
        const modalBloqueo = document.createElement('div');
        modalBloqueo.innerHTML = `
            <div class="fixed inset-0 z-[90] flex items-center justify-center bg-xul_ink p-4 font-sans overflow-hidden">
                <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: linear-gradient(#D1623A 2px, transparent 2px), linear-gradient(90deg, #D1623A 2px, transparent 2px); background-size: 50px 50px;"></div>

                <div class="relative z-10 bg-xul_paper border-[3px] border-xul_ink p-8 md:p-12 max-w-lg w-full text-center shadow-[12px_12px_0px_#6BA4C4]">
                    
                    <div class="w-24 h-24 mx-auto bg-xul_yellow border-[3px] border-xul_ink rounded-full flex items-center justify-center mb-6 shadow-[6px_6px_0px_#2A2A2A] transform hover:rotate-180 transition-transform duration-500">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12 text-xul_ink"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="15.5" r="1.5"></circle><circle cx="15.5" cy="8.5" r="1.5"></circle><circle cx="8.5" cy="15.5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle></svg>
                    </div>
                    
                    <h2 class="font-serif text-3xl md:text-4xl font-bold text-xul_ink leading-tight mb-4">
                        El Oráculo exige un tributo
                    </h2>
                    
                    <p class="font-sans text-lg text-gray-700 mb-8 leading-relaxed">
                        Únete a nuestro Club de Filosofía, desbloquea el acceso total al tablero y descubre este contenido.
                    </p>
                    
                    <button onclick="window.location.href='index.html#unirse'" class="w-full bg-xul_green text-white border-[3px] border-xul_ink font-black text-lg md:text-xl uppercase tracking-widest py-4 shadow-[6px_6px_0px_#2A2A2A] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#2A2A2A] transition-all flex justify-center items-center gap-3 group">
                        Lanzar los dados y Unirse
                    </button>
                    
                    <div class="mt-5">
                        <p class="font-sans text-sm md:text-base text-gray-700">
                            ¿Ya tienes acceso al tablero? 
                            <button onclick="document.getElementById('login-modal').classList.remove('hidden')" class="font-bold underline text-xul_ink hover:text-xul_terra transition-colors cursor-pointer">
                                Inicia sesión aquí
                            </button>
                        </p>
                    </div>

                    <div class="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
                        <a href="index_hack.html" class="text-sm font-bold uppercase tracking-widest text-xul_terra hover:text-xul_ink transition-colors">
                            ← Regresar al catálogo
                        </a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalBloqueo);
    }
});
