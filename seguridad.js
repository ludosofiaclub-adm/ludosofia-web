/**
 * LUDOSOFÍA - Módulo de Seguridad y Control de Acceso
 * Archivo: seguridad.js
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Simulación de la Sesión del Usuario
    // Cambia este valor a: 'publico', 'socio' o 'fundador' para probar.
    const nivelUsuarioActual = 'publico'; 

    // 2. Verificar el objeto de configuración
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
        
        // Ocultar el contenido actual
        Array.from(document.body.children).forEach(child => {
            if (child.tagName !== 'SCRIPT') {
                child.style.display = 'none';
            }
        });

        // HTML del Modal de Bloqueo
        const modalBloqueo = document.createElement('div');
        modalBloqueo.innerHTML = `
            <div class="fixed inset-0 z-[9990] flex items-center justify-center bg-xul_ink p-4 font-sans overflow-hidden">
                <!-- Trama de fondo interactiva -->
                <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: linear-gradient(#D1623A 2px, transparent 2px), linear-gradient(90deg, #D1623A 2px, transparent 2px); background-size: 50px 50px;"></div>

                <div class="relative z-10 bg-xul_paper border-[3px] border-xul_ink p-8 md:p-12 max-w-lg w-full text-center shadow-[12px_12px_0px_#6BA4C4]">
                    
                    <!-- Icono de Búho -->
                    <div class="w-24 h-24 mx-auto bg-xul_yellow border-[3px] border-xul_ink rounded-full flex items-center justify-center mb-6 shadow-[6px_6px_0px_#2A2A2A] transform hover:rotate-180 transition-transform duration-500 cursor-pointer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12 text-xul_ink"><path d="M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20z"/><path d="M9 10a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0zm5 0a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0z"/><path d="M12 16.5c-2.5 0-4-2-4-2s1.5-2 4-2s4 2 4 2s-1.5 2-4 2z"/></svg>
                    </div>
                    
                    <p class="font-sans text-lg text-gray-700 mb-8 leading-relaxed">
                        Unite a nuestro Club de Filosofía, desbloquea el acceso total al tablero y descubre este contenido.
                    </p>
                    
                    <!-- Botón Llamativo de Acción -->
                    <button onclick="window.location.href='suscripcion.html'" class="w-full bg-xul_green text-white border-[3px] border-xul_ink font-black text-lg md:text-xl uppercase tracking-widest py-4 shadow-[6px_6px_0px_#2A2A2A] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#2A2A2A] transition-all flex justify-center items-center gap-3 group">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 group-hover:rotate-12 transition-transform"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="15.5" r="1.5"></circle><circle cx="15.5" cy="8.5" r="1.5"></circle><circle cx="8.5" cy="15.5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle></svg>
                        Lanzar los dados y Unirse
                    </button>
                    
                    <!-- CAMBIO AQUÍ: Ahora es un enlace que abrirá el modal, nota el id="abrir-login-modal" -->
                    <div class="mt-5">
                        <p class="font-sans text-sm md:text-base text-gray-700">
                            ¿Ya tienes acceso al tablero? 
                            <a href="#" id="abrir-login-modal" class="font-bold underline text-xul_ink hover:text-xul_terra transition-colors">
                                Inicia sesión
                            </a>
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

        // ==============================================
        // INYECTAR EL MODAL DE LOGIN/REGISTRO
        // ==============================================
        const htmlModalLogin = `
        <div id="login-modal" class="hidden fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <!-- Fondo oscuro semitransparente -->
            <div id="login-overlay" class="absolute inset-0 bg-xul_ink/80 backdrop-blur-sm cursor-pointer"></div>
            
            <!-- Caja principal -->
            <div class="modal-animate relative bg-xul_paper border-[3px] border-xul_ink p-8 md:p-10 max-w-md w-full shadow-[12px_12px_0px_#EBB134] transform transition-all">
                <!-- Botón Cerrar (X) -->
                <button id="close-modal" class="absolute top-4 right-4 text-xul_ink hover:text-xul_terra transition-colors focus:outline-none">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                <!-- Título e Ícono -->
                <div class="text-center mb-8">
                    <svg viewBox="0 0 50 50" class="w-12 h-12 mx-auto mb-4 text-xul_ink">
                        <circle cx="25" cy="15" r="10" fill="none" stroke="currentColor" stroke-width="3"/>
                        <circle cx="25" cy="15" r="3" fill="currentColor"/>
                        <line x1="25" y1="25" x2="25" y2="45" stroke="currentColor" stroke-width="3"/>
                        <line x1="25" y1="35" x2="35" y2="35" stroke="currentColor" stroke-width="3"/>
                        <line x1="25" y1="42" x2="32" y2="42" stroke="currentColor" stroke-width="3"/>
                    </svg>
                    <h3 id="modal-main-title" class="xul-title text-4xl font-black text-xul_ink tracking-tight uppercase">Entrar al CLUB</h3>
                    <p class="font-sans text-sm text-gray-600 mt-2">Identifícate para continuar tu partida.</p>
                </div>

                <!-- Formulario Clásico -->
                <form id="login-form" class="mb-6">
                    <div class="mb-5">
                        <label class="block font-bold text-xs uppercase tracking-widest text-xul_ink mb-2">Correo Electrónico</label>
                        <input type="email" placeholder="Ej: socrates@mail.com" required class="w-full border-2 border-xul_ink bg-white p-3 font-sans text-lg focus:outline-none focus:border-xul_blue focus:shadow-[4px_4px_0px_#6BA4C4] transition-all">
                    </div>
                    <div class="mb-6">
                        <div class="flex justify-between items-end mb-2">
                            <label class="block font-bold text-xs uppercase tracking-widest text-xul_ink">Clave Secreta</label>
                        </div>
                        <input type="password" placeholder="••••••••" required minlength="6" class="w-full border-2 border-xul_ink bg-white p-3 font-sans text-lg focus:outline-none focus:border-xul_blue focus:shadow-[4px_4px_0px_#6BA4C4] transition-all">
                    </div>
                    <button id="modal-submit-btn" type="submit" class="w-full bg-xul_yellow border-[3px] border-xul_ink py-3 font-black text-lg uppercase tracking-widest text-xul_ink shadow-[4px_4px_0px_#2A2A2A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#2A2A2A] transition-all">
                        Entrar con Clave
                    </button>
                </form>

                <div class="flex items-center my-4">
                    <div class="flex-grow border-t-2 border-xul_ink"></div>
                    <span class="px-3 font-bold text-xs uppercase tracking-widest text-gray-500">O usa tus redes</span>
                    <div class="flex-grow border-t-2 border-xul_ink"></div>
                </div>

                <!-- Botones Sociales -->
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <!-- Google -->
                    <button id="btn-google" type="button" class="flex items-center justify-center gap-2 bg-white border-2 border-xul_ink p-2 font-bold text-sm hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_#2A2A2A] hover:shadow-[4px_4px_0px_#2A2A2A] hover:-translate-y-0.5 transition-all">
                        <svg viewBox="0 0 24 24" class="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                        Google
                    </button>
                    <!-- Microsoft -->
                    <button id="btn-microsoft" type="button" class="flex items-center justify-center gap-2 bg-white border-2 border-xul_ink p-2 font-bold text-sm hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_#2A2A2A] hover:shadow-[4px_4px_0px_#2A2A2A] hover:-translate-y-0.5 transition-all">
                        <svg viewBox="0 0 21 21" class="w-5 h-5"><path fill="#f35325" d="M1 1h9v9H1z"/><path fill="#81bc06" d="M11 1h9v9h-9z"/><path fill="#05a6f0" d="M1 11h9v9H1z"/><path fill="#ffba08" d="M11 11h9v9h-9z"/></svg>
                        Microsoft
                    </button>
                    <!-- Facebook -->
                    <button id="btn-facebook" type="button" class="flex items-center justify-center gap-2 bg-[#1877F2] border-2 border-xul_ink p-2 font-bold text-sm text-white hover:bg-[#166fe5] transition-colors shadow-[2px_2px_0px_#2A2A2A] hover:shadow-[4px_4px_0px_#2A2A2A] hover:-translate-y-0.5 transition-all">
                        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Facebook
                    </button>
                    <!-- Apple -->
                    <button id="btn-apple" type="button" class="flex items-center justify-center gap-2 bg-black border-2 border-xul_ink p-2 font-bold text-sm text-white hover:bg-gray-800 transition-colors shadow-[2px_2px_0px_#2A2A2A] hover:shadow-[4px_4px_0px_#2A2A2A] hover:-translate-y-0.5 transition-all">
                        <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.665-2.94.114-.165.234-.343.35-.531-1.636-.666-2.825-2.434-2.766-4.453.072-2.316 1.831-3.693 1.942-3.765-1.127-1.657-2.898-1.89-3.524-1.928-1.906-.15-3.682 1.163-4.632 1.163-.949 0-2.443-1.082-3.32-1.01zM15.984 4.545c.801-.97 1.341-2.321 1.194-3.666-1.159.047-2.585.772-3.42 1.769-.675.795-1.285 2.181-1.111 3.493 1.294.1 2.541-.628 3.337-1.596z"/></svg>
                        Apple
                    </button>
                </div>
                
                <div class="mt-2 text-center">
                    <span id="toggle-question" class="font-sans text-sm text-gray-600">¿Aún no eres miembro?</span>
                    <a href="#" id="btn-toggle-mode" class="font-bold text-xul_ink hover:text-xul_terra uppercase text-sm tracking-wide ml-1">Regístrate aquí</a>
                </div>
            </div>
        </div>
        `;
        
        // Agregar el modal de Login al final del body
        document.body.insertAdjacentHTML('beforeend', htmlModalLogin);

        // ==============================================
        // LÓGICA DE EVENTOS PARA EL MODAL
        // ==============================================
        const btnAbrirLogin = document.getElementById('abrir-login-modal');
        const modalLogin = document.getElementById('login-modal');
        const btnCerrarLogin = document.getElementById('close-modal');
        const overlayLogin = document.getElementById('login-overlay');

        // Abrir modal
        btnAbrirLogin.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que el navegador salte al inicio de la página
            modalLogin.classList.remove('hidden');
        });

        // Cerrar modal al hacer clic en la X
        btnCerrarLogin.addEventListener('click', () => {
            modalLogin.classList.add('hidden');
        });

        // Cerrar modal al hacer clic en el fondo oscuro
        overlayLogin.addEventListener('click', () => {
            modalLogin.classList.add('hidden');
        });
    }
});
