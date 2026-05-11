import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración de tu proyecto Firebase (reemplazar si es necesario)
const firebaseConfig = {
    apiKey: "AIzaSyBbvpUaTAyeRGT0yxY-YswQab5dRalx5uc",
    authDomain: "ludosofia-1cdc7.firebaseapp.com",
    projectId: "ludosofia-1cdc7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 1. Ocultar la página de inmediato para evitar que usuarios sin permiso vean el contenido
document.documentElement.style.display = 'none';

onAuthStateChanged(auth, async (user) => {
    const config = window.CONFIG_ACCESO;

    if (!user) {
        // ESCENARIO A: NO está logueado
        if (config && config.PUBLICO === false) {
            window.location.replace("login.html"); // Redirige al login
        } else {
            // Si la página es pública, la mostramos
            document.documentElement.style.display = ''; 
        }
    } else {
        // ESCENARIO B: SÍ está logueado -> Buscar su membresía en Firestore
        try {
            const docSnap = await getDoc(doc(db, "usuarios", user.uid));
            
            if (docSnap.exists()) {
                const datos = docSnap.data();
                // Normalizamos el rol a mayúsculas para evitar errores de tipeo
                const rolUsuario = (datos.rol || '').toUpperCase();

                let tieneAcceso = false;

                // Evaluamos contra la configuración de la página
                if (!config || config.PUBLICO) {
                    tieneAcceso = true;
                } else if (config.SOCIO && rolUsuario.includes('SOCIO')) {
                    tieneAcceso = true;
                } else if (config.SOCIO_FUNDADOR && (rolUsuario.includes('FUNDADOR') || rolUsuario.includes('SOCIO_FUNDADOR'))) {
                    tieneAcceso = true;
                }

                if (tieneAcceso) {
                    // Tiene la membresía requerida -> Mostrar la página
                    document.documentElement.style.display = '';
                } else {
                    // Está logueado pero NO tiene el rango necesario -> Redirigir a suscripción
                    window.location.replace("suscripcion.html");
                }
            } else {
                // El usuario existe en Auth pero no tiene documento de perfil en Firestore
                window.location.replace("suscripcion.html");
            }
        } catch (error) {
            console.error("Error al verificar la membresía:", error);
            // Ante cualquier error de lectura de base de datos, lo mandamos al login por seguridad
            window.location.replace("login.html");
        }
    }
});
