// ====================================================================
// GUARDIÁN UNIVERSAL DEL ÁGORA (SEGURIDAD + LOGIN INTEGRADO)
// ====================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, 
    GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBbvpUaTAyeRGT0yxY-YswQab5dRalx5uc",
    authDomain: "ludosofia-1cdc7.firebaseapp.com",
    projectId: "ludosofia-1cdc7",
    storageBucket: "ludosofia-1cdc7.firebasestorage.app",
    messagingSenderId: "542040294003",
    appId: "1:542040294003:web:466f0156db6665a2482006"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 2. LÓGICA DE VERIFICACIÓN
function obtenerRolUsuario() {
    // Si no hay nadie, por defecto es PUBLICO
    return localStorage.getItem('rol_usuario') || 'PUBLICO'; 
}

function verificarAcceso() {
    if (typeof CONFIG_ACCESO === 'undefined') return true; // Libre por defecto

    const rol = (obtenerRolUsuario() || '').toUpperCase().trim();

    if (CONFIG_ACCESO.PUBLICO === true) return true;
    if (CONFIG_ACCESO.SOCIO_FUNDADOR === true && rol.includes('FUNDADOR')) return true;
    if (CONFIG_ACCESO.SOCIO === true && (rol.includes('SOCIO') || rol.includes('FUNDADOR'))) return true;

    return false; // Si llega aquí, NO tiene acceso
}

// 3. INYECCIÓN DE INTERFAZ DE BLOQUEO (Solo se llama si no hay acceso)
function bloquearAcceso() {
    
    // Ocultar el contenido de la página actual
    Array.from(document.body.children).forEach(child => {
        if (child.tagName !== 'SCRIPT') {
            child.style.display = 'none';
        }
    });

    // Inyectar el HTML del modal de bloqueo
    const modalHtml = `
    <div id="guard-login-modal" class="fixed inset-0 z-[9990] flex items-center justify-center p-4 overflow-y-auto bg-xul_ink">
        <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: linear-gradient(#D1623A 2px, transparent 2px), linear-gradient(90deg, #D1623A 2px, transparent 2px); background-size: 50px 50px;"></div>
        
        <div class="relative z-10 bg-xul_paper border-[3px] border-xul_ink p-8 md:p-10 max-w-md w-full shadow-[12px_12px_0px_#EBB134] animate-[modalFadeIn_0.3s_ease-out_forwards]">
            
            <button onclick="window.location.href='index_hack.html'" class="absolute top-4 right-4 text-xul_ink hover:text-xul_terra transition-colors focus:outline-none" title="Volver al catálogo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </button>
            
            <div class="text-center mb-8">
                <div class="w-20 h-20 mx-auto bg-xul_yellow border-[3px] border-xul_ink rounded-full flex items-center justify-center mb-4 shadow-[4px_4px_0px_#2A2A2A]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 text-xul_ink"><path d="M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20z"/><path d="M9 10a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0zm5 0a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0z"/><path d="M12 16.5c-2.5 0-4-2-4-2s1.5-2 4-2s4 2 4 2s-1.5 2-4 2z"/></svg>
                </div>
                <h3 id="guard-modal-title" class="font-serif text-4xl font-black text-xul_ink tracking-tight uppercase">¿Listo para tu turno?</h3>
                <p id="guard-modal-desc" class="font-sans text-sm text-xul_terra font-bold mt-2 tracking-widest uppercase">Inicia tu sesión para continuar tu partida en el tablero.</p>
            </div>

            <form id="guard-login-form" class="mb-6">
                <div class="mb-5">
                    <label class="block font-bold text-xs uppercase tracking-widest text-xul_ink mb-2">Correo Electrónico</label>
                    <input type="email" placeholder="Ej: socrates@mail.com" required class="w-full border-2 border-xul_ink bg-white p-3 font-sans text-lg focus:outline-none focus:border-xul_blue focus:shadow-[4px_4px_0px_#6BA4C4] transition-all">
                </div>
                <div class="mb-6">
                    <label class="block font-bold text-xs uppercase tracking-widest text-xul_ink mb-2">Clave Secreta</label>
                    <input type="password" placeholder="••••••••" required minlength="6" class="w-full border-2 border-xul_ink bg-white p-3 font-sans text-lg focus:outline-none focus:border-xul_blue focus:shadow-[4px_4px_0px_#6BA4C4] transition-all">
                </div>
                <button id="guard-submit-btn" type="submit" class="w-full bg-xul_yellow border-[3px] border-xul_ink py-3 font-black text-lg uppercase tracking-widest text-xul_ink shadow-[4px_4px_0px_#2A2A2A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#2A2A2A] transition-all">
                    Entrar con Clave
                </button>
            </form>

            <div class="flex items-center my-4">
                <div class="flex-grow border-t-2 border-xul_ink"></div>
                <span class="px-3 font-bold text-xs uppercase tracking-widest text-gray-500">O usa tus redes</span>
                <div class="flex-grow border-t-2 border-xul_ink"></div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-6">
                <button id="guard-btn-google" type="button" class="flex items-center justify-center gap-2 bg-white border-2 border-xul_ink p-2 font-bold text-sm hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_#2A2A2A] hover:-translate-y-0.5">
                    <svg viewBox="0 0 24 24" class="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                    Google
                </button>
                <button id="guard-btn-microsoft" type="button" class="flex items-center justify-center gap-2 bg-white border-2 border-xul_ink p-2 font-bold text-sm hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_#2A2A2A] hover:-translate-y-0.5">
                    <svg viewBox="0 0 21 21" class="w-5 h-5"><path fill="#f35325" d="M1 1h9v9H1z"/><path fill="#81bc06" d="M11 1h9v9h-9z"/><path fill="#05a6f0" d="M1 11h9v9H1z"/><path fill="#ffba08" d="M11 11h9v9h-9z"/></svg>
                    Microsoft
                </button>
            </div>
            
            <div class="mt-4 pt-4 border-t-2 border-dashed border-gray-300 text-center">
                 <p class="font-sans text-sm text-gray-700">¿No tienes cuenta? <a href="suscripcion.html" class="font-bold underline text-xul_ink hover:text-xul_terra">Únete al club</a></p>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// 4. EJECUCIÓN AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', () => {
    const tienePermiso = verificarAcceso();
    
    if (!tienePermiso) {
        bloquearAcceso();
    }
});
