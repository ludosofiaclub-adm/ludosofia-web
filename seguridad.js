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

const providerGoogle = new GoogleAuthProvider();
const providerFacebook = new FacebookAuthProvider();
const providerApple = new OAuthProvider('apple.com');
const providerMicrosoft = new OAuthProvider('microsoft.com');

// 2. LÓGICA DE VERIFICACIÓN INSTANTÁNEA
function obtenerRolUsuario() {
    return localStorage.getItem('rol_usuario') || 'FUNDADOR'; 
}

function verificarAcceso() {
    if (typeof CONFIG_ACCESO === 'undefined') return true; // Libre

    const rol = (obtenerRolUsuario() || '').toUpperCase().trim();

    if (CONFIG_ACCESO.PUBLICO === true) return true;
    if (CONFIG_ACCESO.SOCIO_FUNDADOR === true && rol.includes('FUNDADOR')) return true;
    if (CONFIG_ACCESO.SOCIO === true && (rol.includes('SOCIO') || rol.includes('FUNDADOR'))) return true;

    return false;
}

// 3. INYECCIÓN DEL POP-UP HERMOSO DE LOGIN
function inyectarInterfazSeguridad() {
    const modalHtml = `
    <div id="guard-alert-modal" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-xul_ink/80 backdrop-blur-sm cursor-pointer" onclick="document.getElementById('guard-alert-modal').classList.add('hidden')"></div>
        <div id="guard-alert-box" class="relative bg-xul_paper border-[3px] border-xul_ink p-8 md:p-10 max-w-sm w-full shadow-[12px_12px_0px_#D1623A] transform transition-all text-center animate-[modalFadeIn_0.3s_ease-out_forwards]">
            <h3 id="guard-alert-title" class="font-[Cormorant_Garamond] text-3xl font-black text-xul_ink tracking-tight uppercase mb-2">Aviso</h3>
            <p id="guard-alert-message" class="font-sans text-gray-700 mb-6">Mensaje</p>
            <button onclick="document.getElementById('guard-alert-modal').classList.add('hidden')" class="w-full bg-xul_ink text-white font-black py-3 uppercase tracking-widest hover:bg-xul_terra transition-colors border-[3px] border-xul_ink shadow-[4px_4px_0px_#2A2A2A]">Entendido</button>
        </div>
    </div>

    <div id="guard-login-modal" class="fixed inset-0 z-[9990] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-xul_ink/90 backdrop-blur-md"></div>
        
        <div class="relative bg-xul_paper border-[3px] border-xul_ink p-8 md:p-10 max-w-md w-full shadow-[12px_12px_0px_#EBB134] animate-[modalFadeIn_0.3s_ease-out_forwards]">
            <button onclick="window.location.href='index.html'" class="absolute top-4 right-4 text-xul_ink hover:text-xul_terra transition-colors focus:outline-none" title="Volver al inicio">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </button>
            
            <div class="text-center mb-8">
                <svg viewBox="0 0 50 50" class="w-12 h-12 mx-auto mb-4 text-xul_ink">
                    <circle cx="25" cy="15" r="10" fill="none" stroke="currentColor" stroke-width="3"/>
                    <circle cx="25" cy="15" r="3" fill="currentColor"/>
                    <line x1="25" y1="25" x2="25" y2="45" stroke="currentColor" stroke-width="3"/>
                    <line x1="25" y1="35" x2="35" y2="35" stroke="currentColor" stroke-width="3"/>
                    <line x1="25" y1="42" x2="32" y2="42" stroke="currentColor" stroke-width="3"/>
                </svg>
                <h3 id="guard-modal-title" class="font-[Cormorant_Garamond] text-4xl font-black text-xul_ink tracking-tight uppercase">Acceso Restringido</h3>
                <p id="guard-modal-desc" class="font-sans text-sm text-xul_terra font-bold mt-2 tracking-widest uppercase">Identifícate para entrar a esta zona.</p>
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
                <button id="guard-btn-google" type="button" class="flex items-center justify-center gap-2 bg-white border-2 border-xul_ink p-2 font-bold text-sm hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_#2A2A2A] hover:-translate-y-0.5"><svg viewBox="0 0 24 24" class="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>Google</button>
                <button id="guard-btn-microsoft" type="button" class="flex items-center justify-center gap-2 bg-white border-2 border-
